import { ErrorCodes } from './error-codes';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCodes,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details: unknown = null
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: unknown = null) {
    super(ErrorCodes.VALIDATION_ERROR, message, 400, details);
  }
}

export class ApiError extends AppError {
  constructor(
    code: ErrorCodes,
    message: string,
    statusCode: number = 500,
    details: unknown = null
  ) {
    super(code, message, statusCode, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details: unknown = null) {
    super(ErrorCodes.NOT_FOUND, message, 404, details);
  }
}
