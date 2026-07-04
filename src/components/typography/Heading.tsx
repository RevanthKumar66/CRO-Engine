import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const headingVariants = cva('font-sans font-bold tracking-tight text-text-primary', {
  variants: {
    level: {
      h1: 'text-3xl md:text-4xl lg:text-5xl font-extrabold',
      h2: 'text-2xl md:text-3xl font-semibold',
      h3: 'text-xl md:text-2xl font-medium',
      h4: 'text-lg font-medium',
    },
  },
  defaultVariants: {
    level: 'h1',
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const Heading: React.FC<HeadingProps> = ({ className, level, as, ...props }) => {
  const Component = as || (level as 'h1' | 'h2' | 'h3' | 'h4') || 'h1';
  return <Component className={cn(headingVariants({ level, className }))} {...props} />;
};

export default Heading;
