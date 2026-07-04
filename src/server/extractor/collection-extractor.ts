import * as cheerio from 'cheerio';
import { CollectionSnapshot } from '../interfaces/snapshot-types';

export class CollectionExtractor {
  /**
   * Extracts catalog list details from Collection pages.
   * 
   * @param $ Cheerio API wrapper instance.
   */
  public static extract($: cheerio.CheerioAPI): CollectionSnapshot[] {
    const collectionTitle = $('h1').first().text().trim() || 'Collection Catalog';

    // Parse catalog filters (e.g. checkbox options, sidebar tags)
    const filters: string[] = [];
    $('[class*="filter" i] label, [id*="filter" i] label, input[type="checkbox"][name*="filter" i]').each((_, el) => {
      const text = $(el).text().trim() || $(el).attr('value')?.trim();
      if (text && !filters.includes(text)) {
        filters.push(text);
      }
    });

    // Parse sort selectors (e.g. dropdown options)
    const sortingOptions: string[] = [];
    $('[name="sort_by"] option, [class*="sort" i] option').each((_, el) => {
      const text = $(el).text().trim();
      if (text) sortingOptions.push(text);
    });

    // Parse list of catalog items in grids
    const productTitles: string[] = [];
    $('[class*="product-title" i], [class*="product-grid" i] a, [class*="grid-view-item__title" i], .product-item__title').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !productTitles.includes(text)) {
        productTitles.push(text);
      }
    });

    // Only return if we actually matched collection structures
    if (productTitles.length === 0 && filters.length === 0) {
      return [];
    }

    return [{
      collectionTitle,
      filters: filters.slice(0, 15), // cap at 15
      sortingOptions,
      productTitles: productTitles.slice(0, 30), // cap at 30 items
    }];
  }
}

export default CollectionExtractor;
