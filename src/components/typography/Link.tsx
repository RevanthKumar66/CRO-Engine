import React from 'react';
import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import { cn } from '@/utils/cn';

export interface LinkProps
  extends NextLinkProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  external?: boolean;
}

export const Link: React.FC<LinkProps> = ({ className, external = false, children, ...props }) => {
  const isExternal = external || (typeof props.href === 'string' && props.href.startsWith('http'));
  const externalProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <NextLink
      className={cn(
        'font-medium text-accent-violet hover:text-violet-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet rounded cursor-pointer',
        className
      )}
      {...externalProps}
      {...props}
    >
      {children}
    </NextLink>
  );
};

export default Link;
