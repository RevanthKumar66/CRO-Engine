import { z } from 'zod';

/**
 * 1. Environment Schema validation
 */
export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8080),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required for the Opportunity Engine'),
});

/**
 * 2. Storefront URL Schema validation
 * Checks for valid HTTP(S) schemas and prevents SSRF by blocking local loopback / private IP blocks.
 */
export const urlSchema = z
  .string()
  .url('Must be a valid absolute URL')
  .refine(
    (urlStr) => {
      try {
        const parsedUrl = new URL(urlStr);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          return false;
        }

        const hostname = parsedUrl.hostname.toLowerCase();
        // Block standard local host ranges
        const localhostPatterns = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
        if (localhostPatterns.some((pattern) => hostname.includes(pattern))) {
          return false;
        }

        // Block standard private subnet ranges (SSRF mitigation)
        if (
          hostname.startsWith('10.') ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('172.16.') ||
          hostname.startsWith('172.17.') ||
          hostname.startsWith('172.18.') ||
          hostname.startsWith('172.19.') ||
          hostname.startsWith('172.20.') ||
          hostname.startsWith('172.21.') ||
          hostname.startsWith('172.22.') ||
          hostname.startsWith('172.23.') ||
          hostname.startsWith('172.24.') ||
          hostname.startsWith('172.25.') ||
          hostname.startsWith('172.26.') ||
          hostname.startsWith('172.27.') ||
          hostname.startsWith('172.28.') ||
          hostname.startsWith('172.29.') ||
          hostname.startsWith('172.30.') ||
          hostname.startsWith('172.31.')
        ) {
          return false;
        }

        return true;
      } catch (_e) {
        return false;
      }
    },
    {
      message:
        'Store URL must be a public storefront. Local loopbacks and private networks are blocked.',
    }
  );

/**
 * 3. API Audit Request payload Schema
 */
export const auditRequestSchema = z.object({
  url: urlSchema,
});

/**
 * 4. API Audit Response Schema
 */
export const pageScoresSchema = z.object({
  homepage: z.number().int().min(0).max(100),
  pdp: z.number().int().min(0).max(100),
  collection: z.number().int().min(0).max(100),
  cart: z.number().int().min(0).max(100),
});

export const recommendationSchema = z.object({
  id: z.string().min(1),
  pageType: z.enum(['homepage', 'pdp', 'collection', 'cart']),
  category: z.enum(['copywriting', 'layout', 'cta', 'trust', 'mobile', 'performance']),
  finding: z.string().min(1),
  rationale: z.string().min(1),
  actionSteps: z.array(z.string().min(1)).min(1),
  impact: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  effort: z.enum(['HIGH', 'MEDIUM', 'LOW']),
});

export const auditReportSchema = z.object({
  id: z.string().min(1),
  url: z.string().url().optional(),
  storeUrl: z.string().url(),
  domain: z.string().optional(),
  storeName: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  appleTouchIcon: z.string().optional(),
  themeColor: z.string().optional(),
  brandColor: z.string().optional(),
  platform: z.string().optional(),
  overallScore: z.number().int().min(0).max(100),
  status: z.enum(['completed', 'running', 'failed', 'queued']).optional(),
  analysisTime: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  analyzedAt: z.string(),
  pageScores: pageScoresSchema,
  issues: z.array(z.any()).optional(),
  recommendations: z.array(recommendationSchema),
});
