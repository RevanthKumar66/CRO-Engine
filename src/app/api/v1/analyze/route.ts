import { NextRequest, NextResponse } from 'next/server';
import { responseHelpers } from '@/server/api/response-helpers';
import { auditRequestSchema } from '@/server/validation/schemas';
import { ValidationError } from '@/server/errors/app-error';
import { SnapshotOrchestrator } from '@/server/snapshot/snapshot-orchestrator';
import { AnalysisOrchestrator } from '@/server/ai/orchestrator/analysis-orchestrator';
import { AuditRepository } from '@/server/db/audit-repository';
import { logger } from '@/server/logger/structured-logger';

export async function POST(request: NextRequest) {
  const requestId = 'req_' + Math.random().toString(36).substring(2, 10);
  const startTime = Date.now();

  try {
    logger.info('Incoming audit request received', { requestId });

    const body = await request.json();
    const result = auditRequestSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.format());
    }

    const storeUrl = result.data.url;

    // 1. Generate Preprocessed WebsiteSnapshot
    const extractionStart = Date.now();
    const snapshot = await SnapshotOrchestrator.generateSnapshot(storeUrl);
    const extractionDuration = Date.now() - extractionStart;
    logger.info('Website extraction completed', { requestId, durationMs: extractionDuration });

    // 2. Execute AI Analysis Pipeline
    const aiStart = Date.now();
    const orchestrator = new AnalysisOrchestrator();
    const auditReport = await orchestrator.analyze(snapshot);
    const aiDuration = Date.now() - aiStart;
    logger.info('AI Analysis completed', { requestId, durationMs: aiDuration });

    // 3. Persist the generated AuditReport in MongoDB Atlas
    const dbStart = Date.now();
    await AuditRepository.save(auditReport);
    const dbDuration = Date.now() - dbStart;
    logger.info('Database persistence completed', { requestId, durationMs: dbDuration });

    const totalDuration = Date.now() - startTime;
    logger.info('Audit request successfully processed', {
      requestId,
      totalDurationMs: totalDuration,
      extractionDurationMs: extractionDuration,
      aiDurationMs: aiDuration,
      dbDurationMs: dbDuration,
    });

    const payload = responseHelpers.success(auditReport);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const { status, payload } = responseHelpers.fromError(error);
    logger.error('Failed to process audit request', {
      requestId,
      durationMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(payload, { status });
  }
}
