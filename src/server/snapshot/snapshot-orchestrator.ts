import { UrlNormalizer } from '../normalizer/url-normalizer';
import { WebsiteFetcher } from '../crawler/website-fetcher';
import { RobotsChecker } from '../crawler/robots-checker';
import { DomParser } from '../parser/dom-parser';
import { PageClassifier } from './classifier';
import { MetadataExtractor } from '../extractor/metadata-extractor';
import { ProductExtractor } from '../extractor/product-extractor';
import { CollectionExtractor } from '../extractor/collection-extractor';
import { LayoutExtractor } from '../extractor/layout-extractor';
import { WebsiteSnapshot, PageSnapshot } from '../interfaces/snapshot-types';
import { websiteSnapshotSchema } from '../validators/snapshot-validator';
import { ValidationError } from '../errors/app-error';

export class SnapshotOrchestrator {
  /**
   * Orchestrates the complete URL parsing and preprocessing pipeline.
   * Compiles HTML content into a validated structured WebsiteSnapshot object.
   * 
   * @param rawUrl Input storefront URL.
   */
  public static async generateSnapshot(rawUrl: string): Promise<WebsiteSnapshot> {
    // 1. URL Normalization
    const url = UrlNormalizer.normalize(rawUrl);

    // 2. Robots.txt check
    const allowed = await RobotsChecker.isCrawlAllowed(url, '/');
    if (!allowed) {
      throw new Error(`Crawling blocked by robots.txt directives for user agent on: ${url}`);
    }

    // 3. Fetch Homepage HTML
    const homepageHtml = await WebsiteFetcher.fetchHtml(url);

    // 4. Parse DOM & Minify
    const { $, cleanedHtml, cleanedText } = DomParser.parseAndClean(homepageHtml);

    // 5. Extract metadata & layout details
    const metadata = MetadataExtractor.extract($);
    const navigation = LayoutExtractor.extractNavigation($);
    const globalTrust = LayoutExtractor.extractTrust($);

    // 6. Classification checks
    const pageType = PageClassifier.classify(url, $);

    // Extract headings
    const headings: Array<{ tag: string; text: string }> = [];
    $('h1, h2, h3').each((_, el) => {
      const tag = el.tagName.toLowerCase();
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text) headings.push({ tag, text });
    });

    // Extract CTA links
    const ctas: Array<{ label: string; url: string }> = [];
    $('a[class*="btn" i], a[class*="button" i], button').each((_, el) => {
      const label = $(el).text().trim().replace(/\s+/g, ' ');
      const ctaUrl = $(el).attr('href') || '';
      if (label && ctaUrl && !ctaUrl.startsWith('#')) {
        ctas.push({ label, url: ctaUrl });
      }
    });

    const isShopify = homepageHtml.includes('cdn.shopify.com') || homepageHtml.includes('Shopify');

    const primaryPageSnapshot: PageSnapshot = {
      url,
      pageType,
      metadata,
      headings: headings.slice(0, 15),
      cleanedTextSnippet: cleanedText.slice(0, 1000), // Cap primary text snippet at 1000 chars
      ctas: ctas.slice(0, 10),
      trust: globalTrust,
    };

    // If PDP page type, extract product parameters
    if (pageType === 'product') {
      primaryPageSnapshot.products = ProductExtractor.extract($);
    }
    
    // If Collection page type, extract collection details
    if (pageType === 'collection') {
      primaryPageSnapshot.collections = CollectionExtractor.extract($);
    }

    const snapshot: WebsiteSnapshot = {
      storeUrl: url,
      isShopify,
      crawledAt: new Date().toISOString(),
      navigation,
      pages: [primaryPageSnapshot],
      globalTrust,
    };

    // 7. Validate snapshot schema with Zod
    const validationResult = websiteSnapshotSchema.safeParse(snapshot);
    if (!validationResult.success) {
      throw new ValidationError(
        'Compiled snapshot failed schema validation check.',
        validationResult.error.format()
      );
    }

    return validationResult.data;
  }
}

export default SnapshotOrchestrator;
