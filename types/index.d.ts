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
  storeUrl: string;
  overallScore: number;
  analyzedAt: string;
  pageScores: {
    homepage: number;
    pdp: number;
    collection: number;
    cart: number;
  };
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
