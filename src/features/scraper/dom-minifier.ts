/**
 * Minifies storefront HTML content by discarding scripts, styles, embedded assets, 
 * and comments to keep context token payload compact.
 * 
 * @param html Raw HTML source fetched from target page.
 * @returns Clean, structured textual DOM output.
 */
export function minifyHTML(html: string): string {
  if (!html) return '';
  
  // Basic regex cleaning for skeleton scraper (to be augmented with Cheerio parser in Sprint 1)
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();
    
  return clean;
}
