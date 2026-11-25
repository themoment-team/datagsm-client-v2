import type { ComponentProps } from 'react';

import { cn } from '../../lib';
import { ChevronRightIcon } from '../icon';

interface DocLinkProps extends ComponentProps<'a'> {
  href: string;
}

export const DocLink = ({ className, children, ...props }: DocLinkProps) => (
  <a
    className={cn(
      'flex h-12 w-full min-w-0 items-center justify-between gap-2 border-b border-line text-body-16-regular text-foreground hover:bg-row-hover',
      className,
    )}
    {...props}
  >
    <span className="truncate">{children}</span>
    <ChevronRightIcon className="shrink-0 text-foreground-muted" />
  </a>
);
