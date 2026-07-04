export type PageType = 'homepage' | 'product' | 'collection' | 'cart' | 'policy' | 'blog' | 'unknown';

export interface StoreMetadata {
  title: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  twitterCard?: string;
}

export interface NavigationSnapshot {
  links: Array<{ label: string; url: string }>;
  logoText?: string;
}

export interface HeroSnapshot {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface ProductSnapshot {
  title: string;
  price?: number;
  compareAtPrice?: number;
  availability?: boolean;
  ctaText?: string;
  variants?: string[];
  images?: string[];
  reviewCount?: number;
  rating?: number;
  description?: string;
}

export interface CollectionSnapshot {
  collectionTitle?: string;
  filters?: string[];
  sortingOptions?: string[];
  productTitles?: string[];
}

export interface TrustSignals {
  hasSecureConnection?: boolean;
  trustBadges?: string[];
  paymentIcons?: string[];
  shippingInfo?: string;
  returnPolicy?: string;
}

export interface PageSnapshot {
  url: string;
  pageType: PageType;
  metadata: StoreMetadata;
  headings: Array<{ tag: string; text: string }>;
  cleanedTextSnippet: string;
  ctas: Array<{ label: string; url: string }>;
  products?: ProductSnapshot[];
  collections?: CollectionSnapshot[];
  trust?: TrustSignals;
}

export interface WebsiteSnapshot {
  storeUrl: string;
  isShopify: boolean;
  crawledAt: string;
  navigation: NavigationSnapshot;
  pages: PageSnapshot[];
  globalTrust: TrustSignals;
}
export default WebsiteSnapshot;
