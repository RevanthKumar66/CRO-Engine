'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { logger } from '@/server/logger/structured-logger';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Unhandled app router rendering exception:', error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-extrabold tracking-tight text-accent-rose">Error</h1>
      <h2 className="mt-4 text-2xl font-bold text-text-primary">An unexpected exception occurred</h2>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        The application encountered an error while rendering this page interface.
      </p>
      <div className="mt-6 flex gap-4">
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
        <Button variant="primary" onClick={() => reset()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
