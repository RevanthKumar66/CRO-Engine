import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const textVariants = cva('font-sans text-text-primary leading-relaxed', {
  variants: {
    variant: {
      body: 'text-base',
      muted: 'text-text-secondary text-sm',
      description: 'text-text-muted text-sm',
      bold: 'text-base font-semibold',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div';
}

export const Text: React.FC<TextProps> = ({
  className,
  variant,
  as: Component = 'p',
  ...props
}) => {
  return <Component className={cn(textVariants({ variant, className }))} {...props} />;
};

export default Text;
