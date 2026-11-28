import { cn } from '@datagsm/core/shared/lib';
import { ChevronRightIcon } from '@datagsm/core/shared/ui/icon';
import type { ComponentProps } from 'react';

interface DocLinkProps extends ComponentProps<'a'> {
  href: string;
}

// Figma DataGSMv2 "WF/Doc link"를 옮겼다. 관련 문서 칸에서 문서 하나로 가는 한 줄 링크다.
// - 높이 48, 아래 1px line 선, 글자 body-16-regular. 오른쪽에 16px chevron-right(foreground-muted)를 둔다.
// - 제목이 길면 한 줄로 말줄임한다. hover 때 줄 전체를 row-hover로 칠한다.
// - 문서 사이트는 다른 앱(다른 배포)이라 next/link가 아닌 <a>다.
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
