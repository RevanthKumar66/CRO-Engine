import React from 'react';
import { cn } from '@/utils/cn';

interface PageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 duration-300 py-8 md:py-12',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default PageWrapper;
