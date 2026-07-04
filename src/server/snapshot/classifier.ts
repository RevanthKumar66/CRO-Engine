import * as cheerio from 'cheerio';
import { PageType } from '../interfaces/snapshot-types';

export class PageClassifier {
  /**
   * Classifies a storefront page type based on its URL path and DOM elements.
   * 
   * @param url Normalized storefront URL.
   * @param $ Cheerio API wrapper.
   */
  public static classify(url: string, $: cheerio.CheerioAPI): PageType {
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname.toLowerCase();

      // 1. Classification via URL path structures
      if (pathname === '/' || pathname === '/index.html') {
        return 'homepage';
      }
      if (pathname.includes('/products/')) {
        return 'product';
      }
      if (pathname.includes('/collections/')) {
        return 'collection';
      }
      if (pathname === '/cart' || pathname === '/checkout') {
        return 'cart';
      }
      if (pathname.includes('/policies/') || pathname.includes('/pages/privacy') || pathname.includes('/pages/refund')) {
        return 'policy';
      }
      if (pathname.includes('/blogs/') || pathname.includes('/news/')) {
        return 'blog';
      }

      // 2. Fallback classification via DOM indicators
      if ($('form[action*="/cart/add" i]').length > 0) {
        return 'product';
      }
      if ($('[class*="product-grid" i], [class*="collection" i]').length > 0 && $('h1').text().toLowerCase().includes('collection')) {
        return 'collection';
      }
      if ($('form[action*="/cart" i]').length > 0) {
        return 'cart';
      }

      return 'unknown';
    } catch (_e) {
      return 'unknown';
    }
  }
}

export default PageClassifier;
