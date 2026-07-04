import { describe, it, expect } from 'vitest';
import { AppError, ValidationError, ApiError, NotFoundError } from './app-error';
import { ErrorCodes } from './error-codes';

describe('Error Classes Tests', () => {
  it('should instantiate base AppError with correct status and codes', () => {
    const err = new AppError(ErrorCodes.INTERNAL_SERVER_ERROR, 'System failed', 503, {
      reason: 'timeout',
    });
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe(ErrorCodes.INTERNAL_SERVER_ERROR);
    expect(err.message).toBe('System failed');
    expect(err.statusCode).toBe(503);
    expect(err.details).toEqual({ reason: 'timeout' });
  });

  it('should instantiate ValidationError with status 400', () => {
    const err = new ValidationError('Invalid request field', { field: 'url' });
    expect(err.code).toBe(ErrorCodes.VALIDATION_ERROR);
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid request field');
    expect(err.details).toEqual({ field: 'url' });
  });

  it('should instantiate NotFoundError with status 404', () => {
    const err = new NotFoundError('Audit not found');
    expect(err.code).toBe(ErrorCodes.NOT_FOUND);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Audit not found');
  });

  it('should preserve stack traces and set prototype correctly', () => {
    const err = new ApiError(ErrorCodes.SCRAPING_FAILED, 'Fetch failed');
    expect(err.stack).toBeDefined();
    expect(Object.getPrototypeOf(err)).toBe(ApiError.prototype);
  });
});
