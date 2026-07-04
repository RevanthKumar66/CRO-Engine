/**
 * Resolves a promise after a designated delay time, supporting async waiting.
 *
 * @param ms Delay time in milliseconds.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
