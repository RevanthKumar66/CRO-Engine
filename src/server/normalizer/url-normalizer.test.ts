import { describe, it, expect } from 'vitest';
import { UrlNormalizer } from './url-normalizer';
import { ApiError } from '../errors/app-error';

describe('UrlNormalizer Tests', () => {
  it('should auto-prepend HTTPS protocol if missing', () => {
    const result = UrlNormalizer.normalize('gymshark.com');
    expect(result).toBe('https://gymshark.com/');
  });

  it('should lowercase protocol and hostname', () => {
    const result = UrlNormalizer.normalize('HTTP://KylieCosmetics.com/Path/');
    expect(result).toBe('http://kyliecosmetics.com/Path');
  });

  it('should remove multiple trailing slashes from path', () => {
    const result = UrlNormalizer.normalize('https://example.com/some/path///');
    expect(result).toBe('https://example.com/some/path');
  });

  it('should block loopback hostnames', () => {
    expect(() => UrlNormalizer.normalize('localhost')).toThrow(ApiError);
    expect(() => UrlNormalizer.normalize('127.0.0.1')).toThrow(ApiError);
    expect(() => UrlNormalizer.normalize('http://[::1]')).toThrow(ApiError);
  });

  it('should block private network subnets', () => {
    expect(() => UrlNormalizer.normalize('192.168.1.5')).toThrow(ApiError);
    expect(() => UrlNormalizer.normalize('https://10.255.0.1')).toThrow(ApiError);
    expect(() => UrlNormalizer.normalize('http://172.16.0.100')).toThrow(ApiError);
  });

  it('should block unsupported protocols', () => {
    expect(() => UrlNormalizer.normalize('ftp://example.com')).toThrow(ApiError);
    expect(() => UrlNormalizer.normalize('mailto:test@example.com')).toThrow(ApiError);
  });
});
