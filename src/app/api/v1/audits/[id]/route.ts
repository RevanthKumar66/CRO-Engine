import { NextRequest, NextResponse } from 'next/server';
import { responseHelpers } from '@/server/api/response-helpers';
import { NotFoundError } from '@/server/errors/app-error';
import { AuditRepository } from '@/server/db/audit-repository';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Query database for the audit report by its unique ID
    const audit = await AuditRepository.findById(id);

    if (!audit) {
      throw new NotFoundError(`Audit report with ID ${id} not found.`);
    }

    const payload = responseHelpers.success(audit);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const { status, payload } = responseHelpers.fromError(error);
    return NextResponse.json(payload, { status });
  }
}
