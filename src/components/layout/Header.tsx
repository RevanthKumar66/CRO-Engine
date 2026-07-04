'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, LayoutDashboard } from 'lucide-react';
import { routes } from '@/config/routes';
import { Container } from '../common/Container';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border-muted bg-bg-primary/80 backdrop-blur-md">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6 pl-2">
            <Link href={routes.web.home} className="flex items-center hover:opacity-85 transition-opacity">
              <Image
                src="/assets/CRO-main-Logo.png"
                alt="CRO Engine"
                width={140}
                height={44}
                className="h-11 w-auto object-contain"
                style={{ mixBlendMode: 'multiply' }}
                priority
              />
            </Link>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href={routes.web.docs}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary hover:bg-bg-secondary"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Docs</span>
            </Link>
            <Link
              href={routes.web.dashboard}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-muted bg-bg-secondary px-3 py-1.5 text-sm font-medium text-text-primary transition-colors duration-150 hover:border-accent-violet hover:text-accent-violet"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
};
export default Header;
