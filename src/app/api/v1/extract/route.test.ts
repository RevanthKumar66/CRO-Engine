import { vi, describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { SnapshotOrchestrator } from '@/server/snapshot/snapshot-orchestrator';

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

describe('POST /api/v1/extract Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully parse valid body payloads and return preprocessed WebsiteSnapshot', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/extract', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://gymshark.com' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.storeUrl).toBe('https://gymshark.com');
    expect(json.data.isShopify).toBe(true);
    expect(SnapshotOrchestrator.generateSnapshot).toHaveBeenCalledWith('https://gymshark.com');
  });

  it('should return status 400 with validation payload on invalid URL parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/extract', {
      method: 'POST',
      body: JSON.stringify({ url: 'invalid-url' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('ERR_VALIDATION_ERROR');
    expect(SnapshotOrchestrator.generateSnapshot).not.toHaveBeenCalled();
  });
});
