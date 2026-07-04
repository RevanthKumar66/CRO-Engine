import { NextRequest, NextResponse } from 'next/server';
import { responseHelpers } from '@/server/api/response-helpers';
import { auditRequestSchema } from '@/server/validation/schemas';
import { ValidationError } from '@/server/errors/app-error';
import { SnapshotOrchestrator } from '@/server/snapshot/snapshot-orchestrator';
import { AnalysisOrchestrator } from '@/server/ai/orchestrator/analysis-orchestrator';
import { AuditRepository } from '@/server/db/audit-repository';

export async function POST(request: NextRequest) {
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

export async function GET() {
  try {
    // Query most recent 10 audits from MongoDB
    const recentAudits = await AuditRepository.findRecent(10);
    const payload = responseHelpers.success(recentAudits);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const { status, payload } = responseHelpers.fromError(error);
    return NextResponse.json(payload, { status });
  }
}
