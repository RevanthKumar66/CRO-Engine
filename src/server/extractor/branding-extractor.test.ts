import { describe, it, expect, vi } from 'vitest';
import * as cheerio from 'cheerio';
import { BrandingExtractor } from './branding-extractor';

describe('BrandingExtractor Tests', () => {
  it('should correctly normalize relative URLs to absolute', () => {
    const base = 'https://example.com/subpage';
    expect(BrandingExtractor.normalizeUrl('/logo.png', base)).toBe('https://example.com/logo.png');
    expect(BrandingExtractor.normalizeUrl('logo.png', base)).toBe('https://example.com/logo.png');
    expect(BrandingExtractor.normalizeUrl('//cdn.shopify.com/logo.png', base)).toBe(
      'https://cdn.shopify.com/logo.png'
    );
    expect(BrandingExtractor.normalizeUrl('https://other.com/logo.png', base)).toBe(
      'https://other.com/logo.png'
    );
    expect(BrandingExtractor.normalizeUrl('not-a-valid-url:::///xx', base)).toBeNull();
  });

  it('should extract metadata and brand identity from HTML', async () => {
    const html = `
      <html lang="fr">
        <head>
          <title>Gymshark UK | Official Gym Clothing</title>
          <meta name="description" content="Shop official Gymshark Gym Clothing." />
          <meta property="og:site_name" content="Gymshark Official" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-icon.png" />
          <meta property="og:image" content="/og-image.jpg" />
          <meta name="theme-color" content="#1e40af" />
        </head>
        <body>
          <header>
            <img src="/logo.png" alt="Gymshark Logo" class="header-logo" />
          </header>
        </body>
      </html>
    `;
    const $ = cheerio.load(html);
    const result = await BrandingExtractor.extract($, 'https://gymshark.com');

    expect(result.storeName).toBe('Gymshark Official');
    expect(result.domain).toBe('gymshark.com');
    expect(result.title).toBe('Gymshark UK | Official Gym Clothing');
    expect(result.description).toBe('Shop official Gymshark Gym Clothing.');
    expect(result.language).toBe('fr');
    expect(result.platform).toBe('unknown'); // default since cdn.shopify.com isn't in html string
    expect(result.themeColor).toBe('#1e40af');
    expect(result.brandColor).toBe('#1e40af');
    expect(result.faviconUrl).toBe('https://gymshark.com/favicon.ico');
    expect(result.appleTouchIcon).toBe('https://gymshark.com/apple-icon.png');
    expect(result.logoUrl).toBe('https://gymshark.com/logo.png'); // matches DOM probable logo img first
  });

  it('should fallback priority ordering when primary elements are missing', async () => {
    const html = `
      <html>
        <head>
          <title>No Logo Shop</title>
          <link rel="shortcut icon" href="/shortcut.png" />
          <meta property="og:image" content="/fallback-og.png" />
        </head>
        <body>
        </body>
      </html>
    `;
    const $ = cheerio.load(html);
    const result = await BrandingExtractor.extract($, 'https://nologoshop.com');

    expect(result.storeName).toBe('No Logo Shop');
    expect(result.faviconUrl).toBe('https://nologoshop.com/shortcut.png');
    expect(result.logoUrl).toBe('https://nologoshop.com/fallback-og.png'); // falls back to og:image
  });
});
