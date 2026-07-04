import React from 'react';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-extrabold tracking-tight text-accent-violet">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-text-primary">Page Not Found</h2>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        The dashboard view or audit resource you are looking for does not exist or has expired.
      </p>
      <Link href={routes.web.home} className="mt-6">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  );
}
