process.env.GEMINI_API_KEY = 'mock-api-key-for-testing';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalysisOrchestrator } from './analysis-orchestrator';
import { GeminiClient } from '../client/gemini-client';
import { WebsiteSnapshot } from '../../interfaces/snapshot-types';
import { ApiError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';

// Mock the GeminiClient class
vi.mock('../client/gemini-client', () => {
  return {
    GeminiClient: vi.fn().mockImplementation(() => {
      return {
        generateStructuredJson: vi.fn(),
      };
    }),
  };
});

describe('AnalysisOrchestrator Tests', () => {
  let orchestrator: AnalysisOrchestrator;
  let mockClientInstance: any;

  const mockSnapshot: WebsiteSnapshot = {
    storeUrl: 'https://example.com',
    isShopify: true,
    crawledAt: new Date().toISOString(),
    navigation: { links: [{ label: 'Home', url: '/' }] },
    pages: [
      {
        url: 'https://example.com',
        pageType: 'homepage',
        metadata: { title: 'Test Store' },
        headings: [{ tag: 'h1', text: 'Welcome' }],
        cleanedTextSnippet: 'Clean text',
        ctas: [{ label: 'Buy', url: '/cart' }],
      },
    ],
    globalTrust: { hasSecureConnection: true },
  };

  const validResponsePayload = {
    overallScore: 85,
    pageScores: {
      homepage: 90,
      pdp: 80,
      collection: 85,
      cart: 85,
    },
    summary: 'Great storefront setup with high trust factors.',
    recommendations: [
      {
        id: 'rec_1',
        pageType: 'homepage',
        category: 'copywriting',
        finding: 'Value proposition is clear.',
        evidence: 'h1 Welcome',
        rationale: 'Clarifying benefit drives purchase intent.',
        actionSteps: ['Keep it updated'],
        impact: 'HIGH',
        confidence: 'HIGH',
        effort: 'LOW',
        priority: 1,
      },
    ],
    nextActions: ['Action 1'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    orchestrator = new AnalysisOrchestrator();
    mockClientInstance = (GeminiClient as any).mock.results[0].value;
  });

  it('should successfully analyze a storefront snapshot and map to AuditReport', async () => {
    mockClientInstance.generateStructuredJson.mockResolvedValueOnce(
      JSON.stringify(validResponsePayload)
    );

    const result = await orchestrator.analyze(mockSnapshot);

    expect(result.overallScore).toBe(85);
    expect(result.pageScores.homepage).toBe(90);
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].id).toBe('rec_1');
    expect(mockClientInstance.generateStructuredJson).toHaveBeenCalledTimes(1);
  });

  it('should cleanly parse markdown-fenced or trailing-comma malformed JSON responses', async () => {
    const malformedPayload = `
    \`\`\`json
    {
      "overallScore": 85,
      "pageScores": {
        "homepage": 90,
        "pdp": 80,
        "collection": 85,
        "cart": 85
      },
      "summary": "Great storefront setup with high trust factors.",
      "recommendations": [
        {
          "id": "rec_1",
          "pageType": "homepage",
          "category": "copywriting",
          "finding": "Value proposition is clear.",
          "evidence": "h1 Welcome",
          "rationale": "Clarifying benefit drives purchase intent.",
          "actionSteps": ["Keep it updated"],
          "impact": "HIGH",
          "confidence": "HIGH",
          "effort": "LOW",
          "priority": 1
        }
      ],
      "nextActions": ["Action 1"]
    }
    \`\`\`
    `;

    mockClientInstance.generateStructuredJson.mockResolvedValueOnce(malformedPayload);

    const result = await orchestrator.analyze(mockSnapshot);
    expect(result.overallScore).toBe(85);
    expect(mockClientInstance.generateStructuredJson).toHaveBeenCalledTimes(1);
  });

  it('should trigger self-correction retry loop when Zod schema validation fails first time', async () => {
    const invalidSchemaPayload = {
      overallScore: 120, // Invalid: must be <= 100
      pageScores: {
        homepage: 90,
        pdp: 80,
        collection: 85,
        cart: 85,
      },
      summary: 'Short', // Invalid: summary must be >= 10 chars
      recommendations: [],
      nextActions: [], // Invalid: nextActions must contain at least 1 action
    };

    // First call returns invalid schema, second call returns correct payload
    mockClientInstance.generateStructuredJson
      .mockResolvedValueOnce(JSON.stringify(invalidSchemaPayload))
      .mockResolvedValueOnce(JSON.stringify(validResponsePayload));

    const result = await orchestrator.analyze(mockSnapshot);

    expect(result.overallScore).toBe(85);
    expect(mockClientInstance.generateStructuredJson).toHaveBeenCalledTimes(2);
    // Verify corrective instructions were passed in prompt thread of second call
    const secondCallArg = mockClientInstance.generateStructuredJson.mock.calls[1][1];
    expect(secondCallArg).toContain('The schema validation failed');
  });

  it('should fail with ApiError when all self-correction attempts return invalid schemas', async () => {
    const invalidSchemaPayload = {
      overallScore: 85,
      pageScores: { homepage: 90, pdp: 80, collection: 85, cart: 85 },
      summary: 'Bad summary',
      recommendations: [], // Missing elements
      nextActions: [],
    };

    mockClientInstance.generateStructuredJson.mockResolvedValue(
      JSON.stringify(invalidSchemaPayload)
    );

    await expect(orchestrator.analyze(mockSnapshot)).rejects.toThrow(ApiError);
    expect(mockClientInstance.generateStructuredJson).toHaveBeenCalledTimes(3);
  });

  it('should bubble up GeminiClient timeout or network failures', async () => {
    mockClientInstance.generateStructuredJson.mockRejectedValue(
      new ApiError(ErrorCodes.AI_PROCESSING_ERROR, 'Gemini connection timed out', 504)
    );

    await expect(orchestrator.analyze(mockSnapshot)).rejects.toThrow(
      expect.objectContaining({
        code: ErrorCodes.AI_PROCESSING_ERROR,
        statusCode: 504,
      })
    );
  });
});
