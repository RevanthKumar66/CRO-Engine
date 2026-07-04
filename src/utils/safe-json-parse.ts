/**
 * Safely parses a JSON string, returning a default value or null upon failure,
 * instead of throwing an unhandled exception.
 * 
 * @param text The target JSON string.
 * @param defaultValue Fallback value if parsing fails.
 */
export function safeJsonParse<T>(text: string, defaultValue: T): T;
export function safeJsonParse<T>(text: string): T | null;
export function safeJsonParse<T>(text: string, defaultValue: T | null = null): T | null {
  if (!text) return defaultValue;
  try {
    return JSON.parse(text) as T;
  } catch (_error) {
    return defaultValue;
  }
}
