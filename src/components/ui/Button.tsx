import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-xs font-semibold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer border border-transparent select-none',
  {
    variants: {
      variant: {
        primary: 'bg-accent-violet text-white hover:bg-blue-800 active:bg-blue-900',
        secondary:
          'bg-bg-secondary text-text-primary border-border-muted hover:bg-slate-100/80 active:bg-slate-200/50',
        outline:
          'bg-transparent text-text-secondary border-border-muted hover:bg-slate-50 hover:text-text-primary',
        ghost:
          'text-text-secondary hover:text-text-primary hover:bg-slate-100/60 active:bg-slate-200/40',
        destructive: 'bg-accent-rose text-white hover:bg-red-700 active:bg-red-800',
      },
      size: {
        sm: 'h-8 px-3 text-[11px] rounded-md',
        default: 'h-9 px-4 rounded-md',
        lg: 'h-10 px-6 text-sm rounded-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button: React.FC<ButtonProps> = ({ className, variant, size, ...props }) => {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
};

export default Button;
export { buttonVariants };
