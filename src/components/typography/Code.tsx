import React from 'react';
import { cn } from '@/utils/cn';

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  block?: boolean;
}

export const Code: React.FC<CodeProps> = ({ className, block = false, ...props }) => {
  const Component = block ? 'pre' : 'code';
  return (
    <Component
      className={cn(
        'font-mono text-sm bg-bg-secondary border border-border-muted text-violet-300 rounded px-1.5 py-0.5 max-w-full overflow-x-auto',
        block && 'block p-4 overflow-y-auto leading-relaxed my-2',
        className
      )}
      {...props}
    />
  );
};

export default Code;
