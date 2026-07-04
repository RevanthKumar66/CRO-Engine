import * as cheerio from 'cheerio';
import { BrandingData } from '../interfaces/snapshot-types';

export class BrandingExtractor {
  /**
   * Extracts branding assets and metadata from a storefront DOM.
   *
   * @param $ Cheerio API instance.
   * @param baseUrl Base URL of the storefront.
   */
  public static async extract($: cheerio.CheerioAPI, baseUrl: string): Promise<BrandingData> {
    // 1. Domain
    let domain = '';
    try {
      domain = new URL(baseUrl).hostname.replace(/^www\./, '');
    } catch {}

    // 2. Store Name
    const storeName =
      $('meta[property="og:site_name"]').first().attr('content')?.trim() ||
      $('meta[name="application-name"]').first().attr('content')?.trim() ||
      $('title').first().text().split('|')[0].split('-')[0].trim() ||
      domain.split('.')[0] ||
      '';

    // 3. Title
    const title =
      $('title').first().text().trim() ||
      $('meta[property="og:title"]').first().attr('content')?.trim() ||
      '';

    // 4. Description
    const description =
      $('meta[name="description"]').first().attr('content')?.trim() ||
      $('meta[property="og:description"]').first().attr('content')?.trim() ||
      '';

    // 5. Language
    const language = $('html').attr('lang')?.trim() || 'en';

    // 6. Platform
    const isShopify = $.html().includes('cdn.shopify.com') || $.html().includes('Shopify');
    const platform = isShopify ? 'shopify' : 'unknown';

    // 7. Theme Color
    const themeColor =
      $('meta[name="theme-color"]').first().attr('content')?.trim() ||
      $('meta[name="msapplication-TileColor"]').first().attr('content')?.trim() ||
      undefined;

    // 8. Brand Color (defaults to themeColor if found)
    const brandColor = themeColor;

    // 9. Collect icon / image candidates
    const faviconCandidates: string[] = [];
    const appleTouchCandidates: string[] = [];
    const maskIconCandidates: string[] = [];
    const ogImageCandidates: string[] = [];
    const domLogoCandidates: string[] = [];

    // Search links for favicons, apple touch icons, mask icons
    $('link[rel*="icon"]').each((_, el) => {
      const rel = $(el).attr('rel') || '';
      const href = $(el).attr('href');
      if (href) {
        if (rel.includes('apple-touch-icon')) {
          appleTouchCandidates.push(href);
        } else if (rel.includes('mask-icon')) {
          maskIconCandidates.push(href);
        } else {
          faviconCandidates.push(href);
        }
      }
    });

    $('link[rel="apple-touch-icon"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) appleTouchCandidates.push(href);
    });

    $('link[rel="shortcut icon"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) faviconCandidates.push(href);
    });

    $('link[rel="mask-icon"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) maskIconCandidates.push(href);
    });

    // OG Image
    $('meta[property="og:image"]').each((_, el) => {
      const content = $(el).attr('content');
      if (content) ogImageCandidates.push(content);
    });

    // DOM logos: img[alt*="logo"], img[class*="logo"], img[id*="logo"], img[class*="brand"], header img
    const domSelectors = [
      'img[alt*="logo" i]',
      'img[class*="logo" i]',
      'img[id*="logo" i]',
      'img[class*="brand" i]',
      'header img',
      'nav img',
    ];

    domSelectors.forEach((selector) => {
      $(selector).each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src) domLogoCandidates.push(src);
      });
    });

    // Helper to normalize and test reachability
    const resolveAndVerify = async (candidates: string[]): Promise<string | undefined> => {
      const resolved = candidates
        .map((c) => this.normalizeUrl(c, baseUrl))
        .filter((c): c is string => c !== null);

      const unique = Array.from(new Set(resolved));

      // Resolve reachability
      for (const url of unique) {
        if (await this.isReachable(url)) {
          return url;
        }
      }
      return undefined;
    };

    // Extract Favicon URL
    let faviconUrl = await resolveAndVerify(faviconCandidates);
    if (!faviconUrl && faviconCandidates.length > 0) {
      faviconUrl = this.normalizeUrl(faviconCandidates[0], baseUrl) || undefined;
    }
    // Fallback to default /favicon.ico
    if (!faviconUrl) {
      const defaultFavicon = new URL('/favicon.ico', baseUrl).toString();
      if (await this.isReachable(defaultFavicon)) {
        faviconUrl = defaultFavicon;
      }
    }

    // Extract Apple Touch Icon
    const appleTouchIcon = await resolveAndVerify(appleTouchCandidates);

    // Extract OG Image
    const ogImage = await resolveAndVerify(ogImageCandidates);

    // Extract Logo URL following priority order
    let logoUrl = await resolveAndVerify(domLogoCandidates);
    if (!logoUrl) logoUrl = ogImage;
    if (!logoUrl) logoUrl = appleTouchIcon;
    if (!logoUrl) logoUrl = await resolveAndVerify(maskIconCandidates);
    if (!logoUrl) logoUrl = faviconUrl;

    return {
      storeName,
      domain,
      title,
      description,
      logoUrl,
      faviconUrl,
      appleTouchIcon,
      ogImage,
      themeColor,
      brandColor,
      language,
      platform,
    };
  }

  /**
   * Resolves relative URLs to absolute URLs.
   */
  public static normalizeUrl(relativeUrl: string, baseUrl: string): string | null {
    try {
      if (
        relativeUrl.startsWith('mailto:') ||
        relativeUrl.startsWith('tel:') ||
        relativeUrl.startsWith('javascript:')
      ) {
        return null;
      }
      if (relativeUrl.startsWith('//')) {
        return `https:${relativeUrl}`;
      }
      const resolved = new URL(relativeUrl, baseUrl);
      if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') {
        return null;
      }
      if (
        relativeUrl.includes(':') &&
        !relativeUrl.startsWith('http:') &&
        !relativeUrl.startsWith('https:') &&
        !relativeUrl.startsWith('//')
      ) {
        return null;
      }
      return resolved.toString();
    } catch {
      return null;
    }
  }

  /**
   * Verifies if a given image URL is reachable using fetch HEAD/GET.
   */
  public static async isReachable(url: string): Promise<boolean> {
    if (
      process.env.NODE_ENV === 'test' &&
      !url.startsWith('http://localhost') &&
      !url.startsWith('https://localhost')
    ) {
      // In tests, skip actual network requests for external domains
      return true;
    }

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1500); // 1.5s timeout
      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      clearTimeout(id);
      if (res.ok) {
        return true;
      }
      if (res.status === 405 || res.status === 403) {
        // Fallback to GET if HEAD is blocked or not supported
        const controllerGet = new AbortController();
        const idGet = setTimeout(() => controllerGet.abort(), 1500);
        const resGet = await fetch(url, {
          method: 'GET',
          signal: controllerGet.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        clearTimeout(idGet);
        return resGet.ok;
      }
      return false;
    } catch {
      return false;
    }
  }
}
