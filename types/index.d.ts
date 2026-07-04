export type TargetPageType = 'homepage' | 'pdp' | 'collection' | 'cart';
export type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type EffortLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface StorefrontMetadata {
  url: string;
  detectedPlatform: 'shopify' | 'unknown';
  headings: Array<{ tag: string; text: string }>;
  ctas: Array<{ label: string; href: string; classes: string }>;
  rawContentSnippet: string;
}

export interface Recommendation {
  id: string;
  pageType: TargetPageType;
  category: 'copywriting' | 'layout' | 'cta' | 'trust' | 'mobile' | 'performance';
  finding: string;
  rationale: string;
  actionSteps: string[];
  impact: ImpactLevel;
  effort: EffortLevel;
}

export interface AuditReport {
  id: string;
  url?: string;
  storeUrl: string;
  domain?: string;
  storeName?: string;
  title?: string;
  description?: string;
  logoUrl?: string;
  faviconUrl?: string;
  appleTouchIcon?: string;
  themeColor?: string;
  brandColor?: string;
  platform?: string;
  overallScore: number;
  status?: 'completed' | 'running' | 'failed' | 'queued';
  analysisTime?: number;
  createdAt?: string;
  updatedAt?: string;
  analyzedAt: string;
  pageScores: {
    homepage: number;
    pdp: number;
    collection: number;
    cart: number;
  };
  issues?: any[];
  recommendations: Recommendation[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
