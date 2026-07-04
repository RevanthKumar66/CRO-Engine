import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold select-none border border-transparent transition-colors",
  {
    variants: {
      variant: {
        default: "bg-bg-secondary text-text-primary border-border-muted",
        success: "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20",
        warning: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
        destructive: "bg-accent-rose/10 text-accent-rose border-accent-rose/20",
        accent: "bg-accent-violet-glow text-accent-violet border-accent-violet/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  ...props
}) => {
  return (
    <span
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
};

export default Badge;
export { badgeVariants };
