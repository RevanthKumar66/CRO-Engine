import { ErrorCodes } from './error-codes';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCodes,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details: any = null
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
