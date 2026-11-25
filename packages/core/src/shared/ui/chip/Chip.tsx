import type { ReactNode } from 'react';

import { cn } from '../../lib';
import { CloseIcon } from '../icon';

interface ChipProps {
  children: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
}

// 글자가 문자열·숫자면 "<글자> 삭제", 아니면 "삭제"만 쓴다. 요소를 넘기면 removeLabel로 이름을 정한다.
const getRemoveLabel = (children: ReactNode) =>
  typeof children === 'string' || typeof children === 'number' ? `${children} 삭제` : '삭제';

// Figma DataGSMv2 "WF/Chip"(설명 "입력해서 쌓는 값(기술 스택 등). 삭제를 끄면 읽기 전용 칩.")을 옮겼다.
// - 높이 32, 좌우 12, 글자·아이콘 간격 4, 1px wf/line 선, 4px 모서리, 배경 없음. 글자 label-14(wf/text), 줄 바꿈 없이 글자만큼 넓어진다.
// - 지우기 아이콘은 16px WF/icon/close, 색은 wf/text-muted. onRemove를 넘기면 지우기 버튼이 생긴다(넘기지 않으면 읽기 전용).
// - 지우기 버튼의 hover는 Figma에 없다. 누르는 영역을 아이콘 둘레 4px씩 넓혀 24px로 만들고(칩 안에 들어간다),
//   hover 때 그 영역에 WF/Link처럼 wf/hover 칠을 깐다. 칠은 ::before를 -z로 아이콘 뒤에 둔다.
// - 칩 여러 개를 놓는 간격(flex-wrap gap-2 등)은 쓰는 쪽이 정한다.
export const Chip = ({ children, onRemove, removeLabel, className }: ChipProps) => (
  <span
    className={cn(
      'inline-flex h-8 items-center gap-1 rounded border border-line px-3 text-label-14 whitespace-nowrap text-foreground',
      className,
    )}
  >
    {children}
    {onRemove && (
      <button
        type="button"
        aria-label={removeLabel ?? getRemoveLabel(children)}
        onClick={onRemove}
        className="relative isolate flex cursor-pointer text-foreground-muted before:absolute before:-inset-1 before:-z-10 before:rounded hover:before:bg-hover"
      >
        <CloseIcon />
      </button>
    )}
  </span>
);
