import { describe, it, expect } from 'vitest';
import { urlSchema, auditRequestSchema, auditReportSchema } from './schemas';

describe('Validation Schemas Tests', () => {
  describe('urlSchema', () => {
    it('should validate public HTTP and HTTPS URLs', () => {
      expect(urlSchema.safeParse('https://gymshark.com').success).toBe(true);
      expect(urlSchema.safeParse('http://quickstart-theme-default.myshopify.com').success).toBe(true);
    });

    it('should reject invalid and empty strings', () => {
      expect(urlSchema.safeParse('').success).toBe(false);
      expect(urlSchema.safeParse('not-a-url').success).toBe(false);
    });

    it('should reject loopback/localhost domains', () => {
      expect(urlSchema.safeParse('http://localhost:3000').success).toBe(false);
      expect(urlSchema.safeParse('http://127.0.0.1').success).toBe(false);
    });

    it('should reject private subnet IPs', () => {
      expect(urlSchema.safeParse('https://192.168.0.1').success).toBe(false);
      expect(urlSchema.safeParse('http://10.0.0.1').success).toBe(false);
      expect(urlSchema.safeParse('http://172.16.5.5').success).toBe(false);
    });
  });

  describe('auditRequestSchema', () => {
    it('should parse valid body payloads', () => {
      const payload = { url: 'https://kyliecosmetics.com' };
      const parsed = auditRequestSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
    });

    it('should fail on missing URL properties', () => {
      expect(auditRequestSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('auditReportSchema', () => {
    it('should validate full AuditReport payloads', () => {
      const mockReport = {
        id: 'aud_12345678',
        storeUrl: 'https://example.com',
        overallScore: 85,
        analyzedAt: new Date().toISOString(),
        pageScores: {
          homepage: 80,
          pdp: 90,
          collection: 75,
          cart: 85,
        },
        recommendations: [
          {
            id: 'rec_1',
            pageType: 'homepage',
            category: 'copywriting',
            finding: 'Missing primary value proposition.',
            rationale: 'Customers need immediate product details.',
            actionSteps: ['Write hero headline.'],
            impact: 'HIGH',
            effort: 'LOW',
          },
        ],
      };
      expect(auditReportSchema.safeParse(mockReport).success).toBe(true);
    });

    it('should fail if scores are out of bounds', () => {
      const mockReport = {
        id: 'aud_12345678',
        storeUrl: 'https://example.com',
        overallScore: 150, // Out of bounds
        analyzedAt: new Date().toISOString(),
        pageScores: {
          homepage: 80,
          pdp: 90,
          collection: 75,
          cart: 85,
        },
        recommendations: [],
      };
      expect(auditReportSchema.safeParse(mockReport).success).toBe(false);
    });
  });
});
