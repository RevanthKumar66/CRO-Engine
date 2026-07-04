import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuditRepository } from './audit-repository';
import { clientPromise } from './mongodb-client';
import { AuditReport } from '../../../types';

// Mock MongoClient connection Promise (variables prefixed with 'mock' are allowed in hoisted vi.mock factory block)
const mockReplaceOne = vi.fn().mockResolvedValue({});
const mockFindOne = vi.fn().mockResolvedValue(null);
const mockCreateIndex = vi.fn().mockResolvedValue({});
const mockToArray = vi.fn().mockResolvedValue([]);

vi.mock('./mongodb-client', () => {
  return {
    clientPromise: Promise.resolve({
      db: vi.fn().mockReturnValue({
        collection: vi.fn().mockReturnValue({
          replaceOne: (...args: any[]) => mockReplaceOne(...args),
          findOne: (...args: any[]) => mockFindOne(...args),
          createIndex: (...args: any[]) => mockCreateIndex(...args),
          find: () => ({
            sort: () => ({
              limit: () => ({
                toArray: () => mockToArray(),
              }),
            }),
          }),
        }),
      }),
    }),
    default: Promise.resolve({}),
  };
});

describe('AuditRepository Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully persist AuditReport document in Mongo', async () => {
    const report: AuditReport = {
      id: 'aud_test1',
      storeUrl: 'https://example.com',
      overallScore: 82,
      analyzedAt: new Date().toISOString(),
      pageScores: { homepage: 80, pdp: 85, collection: 80, cart: 83 },
      recommendations: [],
    };

    await AuditRepository.save(report);

    expect(mockReplaceOne).toHaveBeenCalledTimes(1);
    expect(mockReplaceOne).toHaveBeenLastCalledWith(
      { id: 'aud_test1' },
      report,
      { upsert: true }
    );
  });

  it('should successfully fetch AuditReport document and strip internal _id field', async () => {
    const returnedDbRecord = {
      _id: 'mongo-object-id',
      id: 'aud_test2',
      storeUrl: 'https://example.com',
      overallScore: 75,
      analyzedAt: new Date().toISOString(),
      pageScores: { homepage: 70, pdp: 80, collection: 70, cart: 80 },
      recommendations: [],
    };

    mockFindOne.mockResolvedValueOnce(returnedDbRecord);

    const result = await AuditRepository.findById('aud_test2');

    expect(mockFindOne).toHaveBeenCalledTimes(1);
    expect(mockFindOne).toHaveBeenLastCalledWith({ id: 'aud_test2' });
    expect(result).not.toBeNull();
    expect(result!.id).toBe('aud_test2');
    expect((result as any)._id).toBeUndefined(); // Should be stripped
  });

  it('should return null if record is not found', async () => {
    mockFindOne.mockResolvedValueOnce(null);
    const result = await AuditRepository.findById('aud_missing');
    expect(result).toBeNull();
  });

  it('should successfully fetch recent audits and strip internal _id fields', async () => {
    const mockList = [
      { _id: '1', id: 'aud_1', storeUrl: 'https://store1.com', overallScore: 80, analyzedAt: '2026-07-04T12:00:00Z', pageScores: {}, recommendations: [] },
      { _id: '2', id: 'aud_2', storeUrl: 'https://store2.com', overallScore: 75, analyzedAt: '2026-07-04T11:00:00Z', pageScores: {}, recommendations: [] },
    ];
    mockToArray.mockResolvedValueOnce(mockList);

    const result = await AuditRepository.findRecent(5);

    expect(mockToArray).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('aud_1');
    expect((result[0] as any)._id).toBeUndefined();
  });
});
