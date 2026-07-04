import { describe, it, expect } from 'vitest';
import { JsonParser } from './json-parser';
import { ApiError } from '../../errors/app-error';

describe('JsonParser Tests', () => {
  it('should parse standard JSON string payloads', () => {
    const raw = '{"name": "shopify", "active": true}';
    const parsed = JsonParser.parseCleaned<{ name: string; active: boolean }>(raw);
    expect(parsed.name).toBe('shopify');
    expect(parsed.active).toBe(true);
  });

  it('should strip markdown code fences from the JSON payload', () => {
    const raw = '```json\n{"score": 90}\n```';
    const parsed = JsonParser.parseCleaned<{ score: number }>(raw);
    expect(parsed.score).toBe(90);
  });

  it('should repair trailing commas inside objects and arrays', () => {
    const raw = '{"scores": [10, 20,], "meta": {"id": "1",},}';
    const parsed = JsonParser.parseCleaned<{ scores: number[]; meta: { id: string } }>(raw);
    expect(parsed.scores).toEqual([10, 20]);
    expect(parsed.meta.id).toBe('1');
  });

  it('should throw ApiError if raw string is empty', () => {
    expect(() => JsonParser.parseCleaned('')).toThrow(ApiError);
  });

  it('should throw ApiError with status 502 on invalid JSON syntax', () => {
    const raw = '{"unclosed-bracket"';
    expect(() => JsonParser.parseCleaned(raw)).toThrow(ApiError);
    try {
      JsonParser.parseCleaned(raw);
    } catch (err: any) {
      expect(err.statusCode).toBe(502);
    }
  });
});
