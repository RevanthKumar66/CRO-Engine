import { vi, describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { SnapshotOrchestrator } from '@/server/snapshot/snapshot-orchestrator';
import { AnalysisOrchestrator } from '@/server/ai/orchestrator/analysis-orchestrator';
import { AuditRepository } from '@/server/db/audit-repository';

// Mock all internal dependency classes
vi.mock('@/server/snapshot/snapshot-orchestrator', () => {
  return {
    SnapshotOrchestrator: {
      generateSnapshot: vi.fn().mockResolvedValue({
        storeUrl: 'https://gymshark.com',
        isShopify: true,
        crawledAt: '2026-07-04T12:00:00.000Z',
        navigation: { links: [], logoText: 'Gymshark' },
        globalTrust: { hasSecureConnection: true },
        pages: [],
      }),
    },
  };
});

const mockAuditReport = {
  id: 'aud_test123',
  storeUrl: 'https://gymshark.com',
  overallScore: 84,
  analyzedAt: '2026-07-04T12:05:00.000Z',
  pageScores: { homepage: 80, pdp: 85, collection: 80, cart: 91 },
  recommendations: [],
};

vi.mock('@/server/ai/orchestrator/analysis-orchestrator', () => {
  return {
    AnalysisOrchestrator: vi.fn().mockImplementation(() => {
      return {
        analyze: vi.fn().mockResolvedValue(mockAuditReport),
      };
    }),
  };
});

vi.mock('@/server/db/audit-repository', () => {
  return {
    AuditRepository: {
      save: vi.fn().mockResolvedValue({}),
    },
  };
});

describe('POST /api/v1/analyze Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should run complete crawl-to-AI-to-DB analysis cycle', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/analyze', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://gymshark.com' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe('aud_test123');
    expect(json.data.overallScore).toBe(84);

    expect(SnapshotOrchestrator.generateSnapshot).toHaveBeenCalledTimes(1);
    expect(AuditRepository.save).toHaveBeenCalledTimes(1);
    expect(AuditRepository.save).toHaveBeenCalledWith(mockAuditReport);
  });

  it('should fail with status 400 when invalid body parameters are supplied', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/analyze', {
      method: 'POST',
      body: JSON.stringify({ url: 'invalid-domain' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('ERR_VALIDATION_ERROR');

    expect(SnapshotOrchestrator.generateSnapshot).not.toHaveBeenCalled();
    expect(AuditRepository.save).not.toHaveBeenCalled();
  });
});
