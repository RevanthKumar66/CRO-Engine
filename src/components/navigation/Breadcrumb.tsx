import React from 'react';
import Link from '@/components/typography/Link';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ className, items, ...props }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center text-sm font-sans text-text-secondary select-none',
        className
      )}
      {...props}
    >
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-text-primary transition-colors text-text-secondary no-underline font-normal"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn('text-text-primary font-medium', isLast && 'text-text-muted')}>
                  {item.label}
                </span>
              )}
              {!isLast && <span className="text-text-muted select-none">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
