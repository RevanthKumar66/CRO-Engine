import { describe, it, expect } from 'vitest';
import { ContextBuilder } from './context-builder';
import { WebsiteSnapshot } from '../../interfaces/snapshot-types';

describe('ContextBuilder Tests', () => {
  it('should compile snapshot details into a clean structured text context', () => {
    const mockSnapshot: WebsiteSnapshot = {
      storeUrl: 'https://gymshark-mock.com',
      isShopify: true,
      crawledAt: new Date().toISOString(),
      navigation: {
        links: [{ label: 'Mens', url: '/mens' }],
        logoText: 'Gymshark',
      },
      globalTrust: {
        hasSecureConnection: true,
        trustBadges: [],
        paymentIcons: ['visa'],
        shippingInfo: 'Free shipping on orders over $75',
        returnPolicy: 'Free returns within 30 days',
      },
      pages: [
        {
          url: 'https://gymshark-mock.com',
          pageType: 'homepage',
          metadata: {
            title: 'Mens Gym Clothes & Activewear',
            metaDescription: 'Shop athletic apparel.',
          },
          headings: [{ tag: 'h1', text: 'Mens Workout Tops' }],
          ctas: [{ label: 'Shop Men', url: '/mens' }],
          cleanedTextSnippet: 'Large blocks of text from the gymshark store layout.',
        },
      ],
    };

    const context = ContextBuilder.build(mockSnapshot);

    expect(context).toContain('STOREFRONT URL: https://gymshark-mock.com');
    expect(context).toContain('IS SHOPIFY PLATFORM: YES');
    expect(context).toContain('NAVIGATION LINKS: [Mens](/mens)');
    expect(context).toContain('SHIPPING DETAILS: Free shipping on orders over $75');
    expect(context).toContain('--- PAGE 1: HOMEPAGE ---');
    expect(context).toContain('TITLE: Mens Gym Clothes & Activewear');
    expect(context).toContain('PAGE HEADINGS: H1: Mens Workout Tops');
    expect(context).toContain('CALL-TO-ACTIONS: "Shop Men" -> /mens');
    expect(context).toContain(
      'CLEAN TEXT BLOCKS: Large blocks of text from the gymshark store layout.'
    );
  });
});
