import { cn } from '@datagsm/core/shared/lib';
import { ChevronRightIcon } from '@datagsm/core/shared/ui/icon';
import type { ComponentProps } from 'react';

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
