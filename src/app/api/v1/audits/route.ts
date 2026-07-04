import { NextRequest, NextResponse } from 'next/server';
import { responseHelpers } from '@/server/api/response-helpers';
import { auditRequestSchema } from '@/server/validation/schemas';
import { ValidationError } from '@/server/errors/app-error';
import { SnapshotOrchestrator } from '@/server/snapshot/snapshot-orchestrator';
import { AnalysisOrchestrator } from '@/server/ai/orchestrator/analysis-orchestrator';
import { AuditRepository } from '@/server/db/audit-repository';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const result = auditRequestSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.format());
    }

    const storeUrl = result.data.url;

    // 1. Generate Preprocessed WebsiteSnapshot
    const snapshot = await SnapshotOrchestrator.generateSnapshot(storeUrl);

    // 2. Execute AI Analysis Pipeline
    const orchestrator = new AnalysisOrchestrator();
    const auditReport = await orchestrator.analyze(snapshot);

    const totalDuration = Date.now() - startTime;
    auditReport.analysisTime = parseFloat((totalDuration / 1000).toFixed(2));

    // 3. Save to database
    await AuditRepository.save(auditReport);

    const payload = responseHelpers.success({
      id: auditReport.id,
      message: `Audit successfully created for: ${auditReport.storeUrl}`,
    });

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    const { status, payload } = responseHelpers.fromError(error);
    return NextResponse.json(payload, { status });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const sort = searchParams.get('sort') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

    const result = await AuditRepository.findWithFilters({
      search,
      status,
      sort,
      page,
      limit,
    });

    const stats = await AuditRepository.getStats();

    const payload = responseHelpers.success({
      ...result,
      stats,
    });
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const { status, payload } = responseHelpers.fromError(error);
    return NextResponse.json(payload, { status });
  }
}
