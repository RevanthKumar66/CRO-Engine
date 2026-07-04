import * as cheerio from 'cheerio';
import { StoreMetadata } from '../interfaces/snapshot-types';

export class MetadataExtractor {
  /**
   * Extracts e-commerce header metadata from Cheerio DOM tree.
   * 
   * @param $ Cheerio API wrapper instance.
   */
  public static extract($: cheerio.CheerioAPI): StoreMetadata {
    const title = $('title').first().text().trim() || $('meta[property="og:title"]').first().attr('content')?.trim() || '';
    const metaDescription = $('meta[name="description"]').first().attr('content')?.trim() || '';
    
    const ogTitle = $('meta[property="og:title"]').first().attr('content')?.trim() || '';
    const ogDescription = $('meta[property="og:description"]').first().attr('content')?.trim() || '';
    const ogImage = $('meta[property="og:image"]').first().attr('content')?.trim() || '';
    const canonicalUrl = $('link[rel="canonical"]').first().attr('href')?.trim() || '';
    const twitterCard = $('meta[name="twitter:card"]').first().attr('content')?.trim() || '';

    return {
      title,
      metaDescription,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      twitterCard,
    };
  }
}

export default MetadataExtractor;
