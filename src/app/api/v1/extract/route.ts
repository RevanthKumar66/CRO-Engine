import { NextRequest, NextResponse } from 'next/server';
import { responseHelpers } from '@/server/api/response-helpers';
import { auditRequestSchema } from '@/server/validation/schemas';
import { ValidationError } from '@/server/errors/app-error';
import { SnapshotOrchestrator } from '@/server/snapshot/snapshot-orchestrator';
import { logger } from '@/server/logger/structured-logger';

export async function POST(request: NextRequest) {
  const requestId = 'req_' + Math.random().toString(36).substring(2, 10);
  const startTime = Date.now();

  try {
    logger.info('Incoming extract request received', { requestId });

    const body = await request.json();
    const result = auditRequestSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.format());
    }

    // Generate structural HTML preprocessed DOM snapshot
    const extractionStart = Date.now();
    const snapshot = await SnapshotOrchestrator.generateSnapshot(result.data.url);
    const extractionDuration = Date.now() - extractionStart;
    logger.info('Website extraction completed', { requestId, durationMs: extractionDuration });

    const totalDuration = Date.now() - startTime;
    logger.info('Extract request successfully processed', {
      requestId,
      totalDurationMs: totalDuration,
      extractionDurationMs: extractionDuration,
    });

    const payload = responseHelpers.success(snapshot);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const { status, payload } = responseHelpers.fromError(error);
    logger.error('Failed to process extract request', {
      requestId,
      durationMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(payload, { status });
  }
}
