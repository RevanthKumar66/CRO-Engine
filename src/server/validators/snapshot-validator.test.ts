import { describe, it, expect } from 'vitest';
import { websiteSnapshotSchema } from './snapshot-validator';

describe('Snapshot Validator Tests', () => {
  it('should validate complete, well-formed WebsiteSnapshot payloads', () => {
    const mockSnapshot = {
      storeUrl: 'https://example-shopify-store.com',
      isShopify: true,
      crawledAt: new Date().toISOString(),
      navigation: {
        links: [
          { label: 'Shop All', url: '/collections/all' },
          { label: 'About Us', url: '/pages/about' },
        ],
        logoText: 'Mock Store',
      },
      globalTrust: {
        hasSecureConnection: true,
        trustBadges: ['secure-checkout'],
        paymentIcons: ['visa', 'mastercard'],
        shippingInfo: 'Free shipping worldwide',
        returnPolicy: '30-day money back guarantee',
      },
      pages: [
        {
          url: 'https://example-shopify-store.com',
          pageType: 'homepage',
          metadata: {
            title: 'Welcome to Mock Store',
            metaDescription: 'Buy premium mock products here.',
          },
          headings: [{ tag: 'h1', text: 'Premium Mock Collection' }],
          ctas: [{ label: 'Shop Now', url: '/collections/all' }],
          cleanedTextSnippet: 'Mock text contents of the storefront.',
        },
      ],
    };

    const parsed = websiteSnapshotSchema.safeParse(mockSnapshot);
    expect(parsed.success).toBe(true);
  });

  it('should fail validation if storeUrl is missing or invalid', () => {
    const mockInvalidSnapshot = {
      isShopify: true,
      crawledAt: new Date().toISOString(),
      navigation: { links: [] },
      globalTrust: { hasSecureConnection: true },
      pages: [],
    };
    const parsed = websiteSnapshotSchema.safeParse(mockInvalidSnapshot);
    expect(parsed.success).toBe(false);
  });
});
