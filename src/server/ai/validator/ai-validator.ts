import { z } from 'zod';

export const aiRecommendationIssueSchema = z.object({
  id: z.string().min(1),
  pageType: z.enum(['homepage', 'pdp', 'collection', 'cart']),
  category: z.enum(['copywriting', 'layout', 'cta', 'trust', 'mobile', 'performance']),
  finding: z.string().min(1),
  evidence: z.string().min(1),
  rationale: z.string().min(1),
  actionSteps: z.array(z.string().min(1)).min(1),
  impact: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  effort: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

export const aiAnalysisResultRawSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  pageScores: z.object({
    homepage: z.number().int().min(0).max(100),
    pdp: z.number().int().min(0).max(100),
    collection: z.number().int().min(0).max(100),
    cart: z.number().int().min(0).max(100),
  }),
  summary: z.string().min(10),
  recommendations: z.array(aiRecommendationIssueSchema),
  nextActions: z.array(z.string().min(1)).min(1),
});

export type AiAnalysisResultRawSchema = z.infer<typeof aiAnalysisResultRawSchema>;
