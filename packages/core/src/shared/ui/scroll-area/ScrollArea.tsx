import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import { cn } from '@datagsm/core/shared/lib';
import type { ReactNode } from 'react';

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
}

// Figma DataGSMv2 "WF/Scrollbar"(node 1366:479)를 Base UI ScrollArea로 옮긴 세로 스크롤 영역이다.
// - 높이: 최대 높이·고정 높이는 쓰는 쪽이 className으로 준다(예: max-h-70). 넘치면 잘리고 세로로 스크롤한다.
// - 막대: 폭 4, 모서리 2, 트랙 line, thumb foreground-muted. 높이는 영역에 맞추고 thumb 길이는 보이는 비율을 Base UI가 계산한다.
// - 간격: 내용이 넘칠 때만 막대를 그리고(Base UI가 넘치지 않으면 막대를 렌더하지 않는다),
//   그때만 viewport 오른쪽에 막대 폭 4 + 간격 8 = 12를 비워 내용과 겹치지 않게 한다.
// - 휠·드래그·트랙 클릭은 Base UI 동작을 그대로 쓴다. 넘칠 때 viewport가 tab으로 포커스되어 키보드로 스크롤한다.
export const ScrollArea = ({ children, className }: ScrollAreaProps) => (
  <BaseScrollArea.Root className={cn('flex flex-col', className)}>
    <BaseScrollArea.Viewport className="min-h-0 flex-1 data-has-overflow-y:pr-3">
      {children}
    </BaseScrollArea.Viewport>
    <BaseScrollArea.Scrollbar orientation="vertical" className="w-1 rounded-xs bg-line">
      <BaseScrollArea.Thumb className="w-full rounded-xs bg-foreground-muted" />
    </BaseScrollArea.Scrollbar>
  </BaseScrollArea.Root>
);
