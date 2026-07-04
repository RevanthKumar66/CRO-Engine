import { WebsiteSnapshot } from '../../interfaces/snapshot-types';
import { ContextBuilder } from '../context/context-builder';
import { PromptBuilder } from '../prompts/prompt-builder';
import { GeminiClient } from '../client/gemini-client';
import { JsonParser } from '../parser/json-parser';
import { aiAnalysisResultRawSchema } from '../validator/ai-validator';
import { AiAnalysisResultRaw } from '../types/ai-types';
import { DomainMapper } from '../mapper/domain-mapper';
import { AuditReport } from '../../../../types';
import { logger } from '../../logger/structured-logger';
import { ApiError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';

export class AnalysisOrchestrator {
  private readonly client: GeminiClient;

  constructor() {
    this.client = new GeminiClient();
  }

  /**
   * Executes the entire AI reasoning pipeline.
   * Compiles snapshot contexts, prompts Gemini, parses/validates results,
   * and maps items to UI domain AuditReport models.
   * Includes schema self-correction feedback loop.
   *
   * @param snapshot Preprocessed website snapshots.
   */
  public async analyze(snapshot: WebsiteSnapshot): Promise<AuditReport> {
    const startTime = Date.now();

    // 1. Build Context and Prompts
    const storefrontContext = ContextBuilder.build(snapshot);
    const compiledPrompt = PromptBuilder.buildV1(storefrontContext);

    logger.info('Starting AI storefront analysis orchestration', {
      storeUrl: snapshot.storeUrl,
      promptVersion: compiledPrompt.version,
    });

    let currentPromptText = compiledPrompt.userContent;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const rawResponse = await this.client.generateStructuredJson(
          compiledPrompt.systemInstruction,
          currentPromptText
        );

        // Parse JSON content
        const parsedData = JsonParser.parseCleaned<AiAnalysisResultRaw>(rawResponse);

        // Validate structure via Zod
        const validation = aiAnalysisResultRawSchema.safeParse(parsedData);
        if (validation.success) {
          const latency = Date.now() - startTime;
          logger.info('AI storefront analysis completed successfully', {
            storeUrl: snapshot.storeUrl,
            attempts,
            latencyMs: latency,
          });

          // Map raw data back to domain structures
          return DomainMapper.mapToAuditReport(validation.data, snapshot);
        }

        // If validation fails, compile error details for retry thread
        const errorDetails = JSON.stringify(validation.error.format());
        logger.warn('AI response failed Zod schema validation. Retrying with self-correction...', {
          storeUrl: snapshot.storeUrl,
          attempt: attempts,
          validationErrors: errorDetails,
        });

        currentPromptText = `
Here is the raw response that failed Zod validation:
${rawResponse}

The schema validation failed with the following errors:
${errorDetails}

Please review, fix all properties, and return the corrected JSON object matching the schema.
`;
      } catch (error) {
        logger.warn('AI pipeline execution error in loop', {
          storeUrl: snapshot.storeUrl,
          attempt: attempts,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        if (attempts >= maxAttempts) {
          throw error instanceof ApiError
            ? error
            : new ApiError(
                ErrorCodes.AI_PROCESSING_ERROR,
                `AI analysis failed after ${maxAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
                502,
                error
              );
        }

        // Wait briefly before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new ApiError(
      ErrorCodes.AI_VALIDATION_FAILED,
      'Failed to produce schema-conforming conversion recommendations.',
      502
    );
  }
}

export default AnalysisOrchestrator;
