import { WebsiteSnapshot } from '../../interfaces/snapshot-types';

export class ContextBuilder {
  /**
   * Compiles the preprocessed WebsiteSnapshot into a tight, token-efficient,
   * structured string context to serve as Gemini prompt input.
   * 
   * @param snapshot Preprocessed website data.
   */
  public static build(snapshot: WebsiteSnapshot): string {
    const lines: string[] = [];

    lines.push(`STOREFRONT URL: ${snapshot.storeUrl}`);
    lines.push(`IS SHOPIFY PLATFORM: ${snapshot.isShopify ? 'YES' : 'NO'}`);
    
    // 1. Navigation outline
    if (snapshot.navigation.links.length > 0) {
      const linksOutline = snapshot.navigation.links
        .map((l) => `[${l.label}](${l.url})`)
        .join(', ');
      lines.push(`NAVIGATION LINKS: ${linksOutline}`);
    }

    // 2. Global Trust signals
    const trust = snapshot.globalTrust;
    lines.push(`GLOBAL SECURITY: ${trust.hasSecureConnection ? 'SSL Secure' : 'Insecure'}`);
    if (trust.shippingInfo) lines.push(`SHIPPING DETAILS: ${trust.shippingInfo}`);
    if (trust.returnPolicy) lines.push(`RETURN/REFUND DETAILS: ${trust.returnPolicy}`);
    if (trust.paymentIcons && trust.paymentIcons.length > 0) {
      lines.push(`PAYMENT OPTIONS: ${trust.paymentIcons.join(', ')}`);
    }

    // 3. Page snapshots (cap details to keep token counts down)
    snapshot.pages.forEach((page, index) => {
      lines.push(`\n--- PAGE ${index + 1}: ${page.pageType.toUpperCase()} ---`);
      lines.push(`URL: ${page.url}`);
      lines.push(`TITLE: ${page.metadata.title}`);
      if (page.metadata.metaDescription) {
        lines.push(`META DESCRIPTION: ${page.metadata.metaDescription}`);
      }

      // Add structural headings outline
      if (page.headings.length > 0) {
        const headingsOutline = page.headings
          .map((h) => `${h.tag.toUpperCase()}: ${h.text}`)
          .join(' | ');
        lines.push(`PAGE HEADINGS: ${headingsOutline}`);
      }

      // Add call-to-actions list
      if (page.ctas.length > 0) {
        const ctasOutline = page.ctas
          .map((c) => `"${c.label}" -> ${c.url}`)
          .join(', ');
        lines.push(`CALL-TO-ACTIONS: ${ctasOutline}`);
      }

      // If PDP product details exist
      if (page.products && page.products.length > 0) {
        page.products.forEach((prod) => {
          lines.push(`PRODUCT ATTR: Title: ${prod.title} | Price: $${prod.price || 'N/A'} | Availability: ${prod.availability ? 'In Stock' : 'Out of Stock'}`);
          if (prod.variants && prod.variants.length > 0) {
            lines.push(`PRODUCT OPTIONS: ${prod.variants.join(', ')}`);
          }
          if (prod.rating) {
            lines.push(`PRODUCT RATING: ${prod.rating}/5 stars from ${prod.reviewCount || 0} reviews`);
          }
          if (prod.description) {
            lines.push(`PRODUCT DETAIL SNIPPET: ${prod.description.substring(0, 200)}`);
          }
        });
      }

      // If collection details exist
      if (page.collections && page.collections.length > 0) {
        page.collections.forEach((col) => {
          lines.push(`COLLECTION ATTR: Title: ${col.collectionTitle}`);
          if (col.filters && col.filters.length > 0) {
            lines.push(`COLLECTION FILTERS: ${col.filters.join(', ')}`);
          }
          if (col.productTitles && col.productTitles.length > 0) {
            lines.push(`CATALOG ITEMS: ${col.productTitles.slice(0, 10).join(', ')}`);
          }
        });
      }

      // Add minified DOM text context snippet
      if (page.cleanedTextSnippet) {
        lines.push(`CLEAN TEXT BLOCKS: ${page.cleanedTextSnippet.substring(0, 500)}`);
      }
    });

    return lines.join('\n');
  }
}

export default ContextBuilder;
