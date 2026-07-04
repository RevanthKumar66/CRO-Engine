import { ErrorCodes } from '../errors/error-codes';
import { AppError } from '../errors/app-error';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiErrorResponse = ApiResponse<never>;

/**
 * Standard utility helpers to create consistent HTTP JSON API responses.
 */
export const responseHelpers = {
  /**
   * Generates a successful JSON response envelope.
   */
  success<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
    };
  },

  /**
   * Generates a structured error JSON response envelope.
   */
  error(
    code: ErrorCodes,
    message: string,
    details: unknown = null
  ): ApiErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };
  },

  /**
   * Normalizes an unknown thrown exception into a standardized error response.
   */
  fromError(err: unknown): { status: number; payload: ApiErrorResponse } {
    if (err instanceof AppError) {
      return {
        status: err.statusCode,
        payload: this.error(err.code, err.message, err.details),
      };
    }

    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return {
      status: 500,
      payload: this.error(ErrorCodes.INTERNAL_SERVER_ERROR, message),
    };
  },
};
