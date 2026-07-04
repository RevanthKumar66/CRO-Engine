import { NextResponse } from 'next/server';
import { responseHelpers } from '@/server/api/response-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const payload = responseHelpers.success({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      geminiApi: 'connected',
      scraperEngine: 'idle',
    },
  });
  return NextResponse.json(payload);
}
