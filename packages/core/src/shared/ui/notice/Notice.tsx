import { cn } from '@datagsm/core/shared/lib';
import { InfoIcon, WarningIcon } from '@datagsm/core/shared/ui/icon';
import type { ComponentProps } from 'react';

// Figma DataGSMv2 "WF/Notice"(Kind = Info·Warning)를 옮겼다.
// 두 Kind는 아이콘만 다르고 칠·간격·글자색은 같아서 cva 변형 없이 아이콘만 고른다.
const NOTICE_ICONS = {
  info: InfoIcon,
  warning: WarningIcon,
} as const;

interface NoticeProps extends ComponentProps<'div'> {
  kind?: keyof typeof NOTICE_ICONS;
}

// - 면 selected, 안쪽 12, 모서리 4, 아이콘·글자 간격 8. 폭은 부모를 가득 채운다.
// - 글자는 label-14, 아이콘(16px)과 글자 모두 foreground. 문구가 길면 여러 줄로 감기고, Figma처럼 아이콘은 세로 가운데에 둔다.
// - 화면을 열 때부터 있는 안내라서 role을 붙이지 않는다. 나중에 나타나 읽혀야 하면 쓰는 곳에서 role="status"·"alert"를 넘긴다.
export const Notice = ({ kind = 'info', className, children, ...props }: NoticeProps) => {
  const NoticeIcon = NOTICE_ICONS[kind];

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded bg-selected p-3 text-label-14 text-foreground',
        className,
      )}
      {...props}
    >
      <NoticeIcon />
      <p className="min-w-0 flex-1 wrap-break-word">{children}</p>
    </div>
  );
};
