import * as cheerio from 'cheerio';
import { NavigationSnapshot, TrustSignals } from '../interfaces/snapshot-types';

export class LayoutExtractor {
  /**
   * Extracts storefront navigation headers.
   * 
   * @param $ Cheerio API wrapper.
   */
  public static extractNavigation($: cheerio.CheerioAPI): NavigationSnapshot {
    const links: Array<{ label: string; url: string }> = [];
    
    // Find anchors inside nav elements
    $('nav a, header a, [class*="menu" i] a').each((_, el) => {
      const label = $(el).text().trim().replace(/\s+/g, ' ');
      const url = $(el).attr('href') || '';
      
      if (label && url && !url.startsWith('#') && !url.startsWith('javascript:')) {
        // Prevent duplicate links in navigation lists
        if (!links.some((l) => l.url === url)) {
          links.push({ label, url });
        }
      }
    });

    // Logo detection
    const logoText = $('header [class*="logo" i]').first().text().trim() || $('header img').first().attr('alt')?.trim() || '';

    return {
      links: links.slice(0, 20), // cap at 20 primary menu items
      logoText: logoText || undefined,
    };
  }

  /**
   * Extracts trust badges, payment processor signals, refund/return terms, and shipping terms.
   * 
   * @param $ Cheerio API wrapper.
   */
  public static extractTrust($: cheerio.CheerioAPI): TrustSignals {
    const trustBadges: string[] = [];
    const paymentIcons: string[] = [];
    
    // Parse payment indicators (e.g. svg icons or image classes)
    $('[class*="payment" i] img, [class*="payment" i] svg, .payment-icon').each((_, el) => {
      const title = $(el).attr('alt') || $(el).attr('id') || $(el).attr('class') || '';
      if (title && !paymentIcons.includes(title)) {
        paymentIcons.push(title);
      }
    });

    // Look for trust badges, certifications, or guarantees
    $('[class*="trust" i], [class*="badge" i], [class*="guarantee" i]').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 5 && text.length < 100) {
        if (!trustBadges.includes(text)) {
          trustBadges.push(text);
        }
      }
    });

    // Parse shipping policy links or text
    let shippingInfo = '';
    const shippingNode = $('a[href*="shipping" i], [class*="shipping" i]').first();
    if (shippingNode.length > 0) {
      shippingInfo = shippingNode.text().trim().replace(/\s+/g, ' ');
    }

    // Parse return/refund details
    let returnPolicy = '';
    const returnNode = $('a[href*="return" i], a[href*="refund" i], [class*="return" i], [class*="refund" i]').first();
    if (returnNode.length > 0) {
      returnPolicy = returnNode.text().trim().replace(/\s+/g, ' ');
    }

    return {
      hasSecureConnection: true, // We validate protocol in normalizer
      trustBadges: trustBadges.slice(0, 10),
      paymentIcons: paymentIcons.slice(0, 10),
      shippingInfo: shippingInfo.slice(0, 300) || undefined,
      returnPolicy: returnPolicy.slice(0, 300) || undefined,
    };
  }
}

export default LayoutExtractor;
