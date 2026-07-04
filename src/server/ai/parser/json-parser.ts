import { ApiError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';

export class JsonParser {
  /**
   * Cleans and parses raw AI output text into typed JSON objects.
   * Strips markdown code fencing, repairs trailing commas, and sanitizes characters.
   *
   * @param rawText Text output from the model.
   */
  public static parseCleaned<T>(rawText: string): T {
    if (!rawText) {
      throw new ApiError(ErrorCodes.AI_VALIDATION_FAILED, 'Cannot parse empty string', 400);
    }

    let clean = rawText.trim();

    // 1. Remove markdown fences (e.g. ```json ... ```)
    if (clean.startsWith('```')) {
      clean = clean
        .replace(/^```(?:json)?/i, '')
        .replace(/```$/i, '')
        .trim();
    }

    // 2. Simple regex repair to strip trailing commas in objects and arrays
    // E.g., { "a": 1, } -> { "a": 1 }
    clean = clean.replace(/,(\s*[}\]])/g, '$1');

    try {
      return JSON.parse(clean) as T;
    } catch (error) {
      throw new ApiError(
        ErrorCodes.AI_VALIDATION_FAILED,
        `Failed to parse raw Gemini response into valid JSON: ${error instanceof Error ? error.message : 'Unknown JSON syntax'}`,
        502,
        { rawText, clean }
      );
    }
  }
}

export default JsonParser;
