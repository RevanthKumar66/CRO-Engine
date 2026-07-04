import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { env } from '@/config/env';
import { geminiAnalysisResponseSchema } from '../schemas/gemini-schema';
import { ApiError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';

export interface GeminiClientOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class GeminiClient {
  private readonly ai: GoogleGenAI;
  private readonly defaultModel = 'gemini-2.5-flash';

  constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new ApiError(ErrorCodes.INTERNAL_SERVER_ERROR, 'GEMINI_API_KEY environment variable is not configured.');
    }
    this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  /**
   * Executes a content generation query against Gemini API requesting structured outputs.
   * 
   * @param systemInstruction Model role instructions.
   * @param prompt Content context.
   * @param options Configurable parameters.
   */
  public async generateStructuredJson(
    systemInstruction: string,
    prompt: string,
    options: GeminiClientOptions = {}
  ): Promise<string> {
    const model = options.model ?? this.defaultModel;
    const temperature = options.temperature ?? 0.2;
    const maxOutputTokens = options.maxTokens;

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature,
          maxOutputTokens,
          responseMimeType: 'application/json',
          responseSchema: geminiAnalysisResponseSchema,
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
          ],
        },
      });

      const text = response.text;
      if (!text) {
        throw new ApiError(ErrorCodes.AI_PROCESSING_ERROR, 'Empty response returned from Gemini API.', 502);
      }

      return text;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      const message = error instanceof Error ? error.message : 'Unknown Gemini SDK failure';
      if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
        throw new ApiError(ErrorCodes.UNAUTHORIZED, 'Invalid Google Gemini API Key configured.', 401, error);
      }
      if (message.includes('Quota exceeded') || message.includes('429')) {
        throw new ApiError(ErrorCodes.RATE_LIMIT_EXCEEDED, 'Gemini API limit quotas exceeded.', 429, error);
      }
      
      throw new ApiError(ErrorCodes.AI_PROCESSING_ERROR, `Gemini API execution failed: ${message}`, 502, error);
    }
  }
}

export default GeminiClient;
