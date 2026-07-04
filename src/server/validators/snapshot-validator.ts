import { z } from 'zod';

export const pageTypeSchema = z.enum([
  'homepage',
  'product',
  'collection',
  'cart',
  'policy',
  'blog',
  'unknown',
]);

export const storeMetadataSchema = z.object({
  title: z.string(),
  metaDescription: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().url().optional().or(z.literal('')),
  canonicalUrl: z.string().optional(),
  twitterCard: z.string().optional(),
});

export const navigationLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const navigationSnapshotSchema = z.object({
  links: z.array(navigationLinkSchema),
  logoText: z.string().optional(),
});

export const heroSnapshotSchema = z.object({
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
});

export const productSnapshotSchema = z.object({
  title: z.string(),
  price: z.number().optional(),
  compareAtPrice: z.number().optional(),
  availability: z.boolean().optional(),
  ctaText: z.string().optional(),
  variants: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  reviewCount: z.number().optional(),
  rating: z.number().optional(),
  description: z.string().optional(),
});

export const collectionSnapshotSchema = z.object({
  collectionTitle: z.string().optional(),
  filters: z.array(z.string()).optional(),
  sortingOptions: z.array(z.string()).optional(),
  productTitles: z.array(z.string()).optional(),
});

export const trustSignalsSchema = z.object({
  hasSecureConnection: z.boolean().optional(),
  trustBadges: z.array(z.string()).optional(),
  paymentIcons: z.array(z.string()).optional(),
  shippingInfo: z.string().optional(),
  returnPolicy: z.string().optional(),
});

export const headingItemSchema = z.object({
  tag: z.string(),
  text: z.string(),
});

export const ctaItemSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const pageSnapshotSchema = z.object({
  url: z.string().url(),
  pageType: pageTypeSchema,
  metadata: storeMetadataSchema,
  headings: z.array(headingItemSchema),
  cleanedTextSnippet: z.string(),
  ctas: z.array(ctaItemSchema),
  products: z.array(productSnapshotSchema).optional(),
  collections: z.array(collectionSnapshotSchema).optional(),
  trust: trustSignalsSchema.optional(),
});

export const websiteSnapshotSchema = z.object({
  storeUrl: z.string().url(),
  isShopify: z.boolean(),
  crawledAt: z.string().datetime(),
  navigation: navigationSnapshotSchema,
  pages: z.array(pageSnapshotSchema),
  globalTrust: trustSignalsSchema,
});
export default websiteSnapshotSchema;
