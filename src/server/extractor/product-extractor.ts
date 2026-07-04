import * as cheerio from 'cheerio';
import { ProductSnapshot } from '../interfaces/snapshot-types';

export class ProductExtractor {
  /**
   * Parses e-commerce product details from product detail pages (PDPs).
   * 
   * @param $ Cheerio API wrapper instance.
   */
  public static extract($: cheerio.CheerioAPI): ProductSnapshot[] {
    // Locate title
    const title = $('h1').first().text().trim() || $('meta[property="og:title"]').first().attr('content')?.trim() || 'Unknown Product';
    
    // Parse price strings (e.g. "$45.00" -> 45)
    let price: number | undefined;
    const priceText = $('[class*="price" i], [id*="price" i]').text() || '';
    const priceMatch = priceText.match(/\$?([0-9]+(?:\.[0-9]{2})?)/);
    if (priceMatch && priceMatch[1]) {
      price = parseFloat(priceMatch[1]);
    }

    // Availability checks
    let availability = true;
    const buttonText = $('button[type="submit"], input[type="submit"]').text().toLowerCase() || '';
    if (
      buttonText.includes('sold out') || 
      buttonText.includes('out of stock') || 
      $('body').text().toLowerCase().includes('sold out')
    ) {
      availability = false;
    }

    // CTA title
    let ctaText = 'Add to Cart';
    const ctaButton = $('button[name="add"], [class*="add-to-cart" i]').first();
    if (ctaButton.length > 0) {
      ctaText = ctaButton.text().trim();
    }

    // Variants list
    const variants: string[] = [];
    $('select[name="id"] option, [class*="variant" i] option').each((_, el) => {
      const optText = $(el).text().trim();
      if (optText) variants.push(optText);
    });

    // Image list
    const images: string[] = [];
    $('img[class*="product" i], img[id*="product" i], [class*="gallery" i] img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !src.startsWith('data:')) {
        images.push(src);
      }
    });

    // Review count and ratings
    let rating: number | undefined;
    let reviewCount: number | undefined;
    const reviewBlock = $('[class*="review" i], [id*="review" i], [class*="rating" i]').text() || '';
    
    const countMatch = reviewBlock.match(/([0-9]+)\s+reviews?/i);
    if (countMatch && countMatch[1]) {
      reviewCount = parseInt(countMatch[1], 10);
    }

    const ratingMatch = reviewBlock.match(/([0-5](?:\.[0-9])?)\s+(?:stars?|out of 5)/i);
    if (ratingMatch && ratingMatch[1]) {
      rating = parseFloat(ratingMatch[1]);
    }

    // Description text snippet
    const description = $('[class*="description" i], [id*="description" i]').first().text().trim() || '';

    // Only return if we actually matched key product structures (avoid returning garbage on non-PDPs)
    if (title === 'Unknown Product' && !price) {
      return [];
    }

    return [{
      title,
      price,
      availability,
      ctaText,
      variants: variants.slice(0, 10), // cap at 10 variants to keep snapshot tight
      images: images.slice(0, 5),     // cap at 5 images
      reviewCount,
      rating,
      description: description.slice(0, 500), // cap at 500 characters
    }];
  }
}

export default ProductExtractor;
