import * as cheerio from 'cheerio';

export interface CleanedDomResult {
  $: cheerio.CheerioAPI;
  cleanedHtml: string;
  cleanedText: string;
}

export class DomParser {
  /**
   * Loads raw HTML content and strips script, style, svg, json-ld, and cookie banner structures.
   * 
   * @param rawHtml Raw HTML string fetched from the site.
   * @returns Cleaned DOM wrapper.
   */
  public static parseAndClean(rawHtml: string): CleanedDomResult {
    const $ = cheerio.load(rawHtml);

    // 1. Remove non-layout elements
    $('script').remove();
    $('style').remove();
    $('svg').remove();
    $('iframe').remove();
    $('noscript').remove();
    $('link[rel="stylesheet"]').remove();
    
    // Remove specific application/ld+json script blocks
    $('script[type="application/ld+json"]').remove();

    // 2. Remove standard overlay and cookie banner selectors
    const cookieSelectors = [
      '#cookie-banner',
      '.cookie-banner',
      '#cookie-consent',
      '.cookie-consent',
      '#gdpr-cookie-message',
      '[class*="cookie" i]',
      '[id*="cookie" i]',
      '[class*="consent" i]',
      '[id*="consent" i]',
      '[class*="banner" i][class*="cookie" i]',
    ];
    cookieSelectors.forEach((selector) => {
      try {
        $(selector).remove();
      } catch (_e) {
        // Skip invalid CSS selectors
      }
    });

    // 3. Extract cleaned HTML representation
    const cleanedHtml = $.html();

    // 4. Extract cleaned text, reducing spaces and duplicate grids
    let cleanedText = $('body').text() || '';
    cleanedText = cleanedText
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();

    return {
      $,
      cleanedHtml,
      cleanedText,
    };
  }
}

export default DomParser;
