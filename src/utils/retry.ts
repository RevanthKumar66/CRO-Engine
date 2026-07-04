import { delay } from './delay';

interface RetryOptions {
  retries?: number;
  factor?: number;
  minTimeoutMs?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Executes an async task, retrying with exponential backoff on failure.
 * 
 * @param fn Async function to execute.
 * @param options Configurable retry parameters.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const retries = options.retries ?? 3;
  const factor = options.factor ?? 2;
  const minTimeoutMs = options.minTimeoutMs ?? 1000;

  let attempt = 1;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (attempt > retries) {
        throw error;
      }
      
      const err = error instanceof Error ? error : new Error(String(error));
      options.onRetry?.(err, attempt);

      const waitTime = minTimeoutMs * Math.pow(factor, attempt - 1);
      await delay(waitTime);
      attempt++;
    }
  }
}
