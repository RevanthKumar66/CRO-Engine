import { describe, it, expect } from 'vitest';
import { DomainMapper } from './domain-mapper';
import { AiAnalysisResultRaw } from '../types/ai-types';

describe('DomainMapper Tests', () => {
  it('should cleanly map raw analysis schema objects to standard AuditReport domain models', () => {
    const rawResult: AiAnalysisResultRaw = {
      overallScore: 78,
      pageScores: {
        homepage: 80,
        pdp: 75,
        collection: 85,
        cart: 72,
      },
      summary: 'Storefront has solid catalog layouts but cart CTA is low visibility.',
      nextActions: ['Increase cart button contrast.'],
      recommendations: [
        {
          id: 'rec_custom_id',
          pageType: 'cart',
          category: 'cta',
          finding: 'Checkout button blends into background.',
          evidence: 'Checkout button uses light gray background on light gray wrapper.',
          rationale: 'CTAs must have distinct contrast to drive conversions.',
          actionSteps: ['Change CTA color to accent-violet (#1e40af).'],
          impact: 'HIGH',
          confidence: 'HIGH',
          effort: 'LOW',
          priority: 1,
        },
      ],
    };

    const storeUrl = 'https://kyliecosmetics.com';
    const mapped = DomainMapper.mapToAuditReport(rawResult, storeUrl);

    expect(mapped.id).toMatch(/^aud_[a-z0-9]+/);
    expect(mapped.storeUrl).toBe(storeUrl);
    expect(mapped.overallScore).toBe(78);
    expect(mapped.pageScores.homepage).toBe(80);
    
    expect(mapped.recommendations.length).toBe(1);
    const rec = mapped.recommendations[0];
    expect(rec.id).toBe('rec_custom_id');
    expect(rec.pageType).toBe('cart');
    expect(rec.category).toBe('cta');
    expect(rec.finding).toBe('Checkout button blends into background.');
    expect(rec.rationale).toBe('CTAs must have distinct contrast to drive conversions.');
    expect(rec.actionSteps).toEqual(['Change CTA color to accent-violet (#1e40af).']);
    expect(rec.impact).toBe('HIGH');
    expect(rec.effort).toBe('LOW');
  });

  it('should auto-generate fallback IDs if raw recommendation ID is empty', () => {
    const rawResult: AiAnalysisResultRaw = {
      overallScore: 65,
      pageScores: { homepage: 60, pdp: 70, collection: 65, cart: 65 },
      summary: 'Summary text.',
      nextActions: ['Action step'],
      recommendations: [
        {
          id: '', // Empty ID
          pageType: 'homepage',
          category: 'layout',
          finding: 'Missing grid columns.',
          evidence: 'Evidence',
          rationale: 'Rationale',
          actionSteps: ['Fix layout'],
          impact: 'MEDIUM',
          confidence: 'MEDIUM',
          effort: 'MEDIUM',
          priority: 2,
        },
      ],
    };

    const mapped = DomainMapper.mapToAuditReport(rawResult, 'https://example.com');
    expect(mapped.recommendations[0].id).toMatch(/^rec_0_[a-z0-9]+/);
  });
});
