import React from 'react';
import { cn } from '@/utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallbackText: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  alt = 'avatar',
  fallbackText,
  ...props
}) => {
  const initials = fallbackText.substring(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        'relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border-muted select-none',
        className
      )}
      {...props}
    >
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={src} alt={alt} className="aspect-square h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-bg-secondary text-xs font-semibold text-text-primary">
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar;
