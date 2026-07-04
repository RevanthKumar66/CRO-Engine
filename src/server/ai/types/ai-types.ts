export interface AiRecommendationIssue {
  id: string;
  pageType: 'homepage' | 'pdp' | 'collection' | 'cart';
  category: 'copywriting' | 'layout' | 'cta' | 'trust' | 'mobile' | 'performance';
  finding: string;
  evidence: string;
  rationale: string;
  actionSteps: string[];
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  effort: 'HIGH' | 'MEDIUM' | 'LOW';
  priority: 1 | 2 | 3 | 4;
}

export interface AiAnalysisResultRaw {
  overallScore: number;
  pageScores: {
    homepage: number;
    pdp: number;
    collection: number;
    cart: number;
  };
  summary: string;
  recommendations: AiRecommendationIssue[];
  nextActions: string[];
}
