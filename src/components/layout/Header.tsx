'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, LayoutDashboard } from 'lucide-react';
import { routes } from '@/config/routes';
import { Container } from '../common/Container';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border-muted bg-white/75 backdrop-blur-md shadow-sm rounded-b-[10px] sm:rounded-none">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6 pl-1 sm:pl-2">
            <Link
              href={routes.web.home}
              className="flex items-center hover:opacity-85 transition-opacity"
            >
              <Image
                src="/assets/CRO-main-Logo.png"
                alt="CRO Engine"
                width={110}
                height={34}
                className="h-8 sm:h-11 w-auto object-contain"
                style={{ mixBlendMode: 'multiply' }}
                priority
              />
            </Link>
          </div>
          <nav className="flex items-center gap-1 sm:gap-1.5">
            <Link
              href={routes.web.docs}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary hover:bg-bg-secondary"
              title="Documentation"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Docs</span>
            </Link>
            <Link
              href={routes.web.dashboard}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-muted bg-bg-secondary px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-text-primary transition-colors duration-150 hover:border-accent-violet hover:text-accent-violet"
              title="Dashboard"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
};
export default Header;
