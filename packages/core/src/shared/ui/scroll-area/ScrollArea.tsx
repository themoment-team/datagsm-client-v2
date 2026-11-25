import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';

import { cn } from '../../lib';

type ScrollOrientation = 'vertical' | 'horizontal' | 'both';

interface ScrollAreaProps {
  children: React.ReactNode;
  // 바깥 틀(크기)에 붙는다. 높이를 정하는 h-full, max-h-[280px] 같은 클래스를 여기에 넘긴다.
  className?: string;
  // 스크롤되는 내용 상자에 붙는다. 안쪽 여백과 배치(flex, gap)를 여기에 넘긴다.
  contentClassName?: string;
  orientation?: ScrollOrientation;
}

// Figma DataGSMv2 "WF/Scrollbar"(node 1366:479). 폭 4, 모서리 2, 트랙 wf/line, 막대 wf/text-muted.
// 내용이 넘칠 때만 생기고, 막대 길이는 보이는 비율을 따른다. 끝에서 4px 안쪽에 두고 내용 위에 겹쳐 그린다.
const Scrollbar = ({ orientation }: { orientation: 'vertical' | 'horizontal' }) => (
  <BaseScrollArea.Scrollbar
    orientation={orientation}
    className={cn(
      'flex rounded-xs bg-line',
      orientation === 'vertical' ? 'me-1 w-1 justify-center' : 'mb-1 h-1 flex-col justify-center',
    )}
  >
    <BaseScrollArea.Thumb
      className={cn(
        'rounded-xs bg-foreground-muted',
        orientation === 'vertical' ? 'w-full' : 'h-full',
      )}
    />
  </BaseScrollArea.Scrollbar>
);

// 브라우저 기본 스크롤바를 숨기고 디자인 스크롤바를 그린다. 스크롤 자체(휠, 키보드, 터치)는 브라우저가 한다.
// 안쪽 끝에 닿은 휠은 바깥 스크롤 영역으로 이어진다. 이 동작을 막는 overscroll-behavior는 넣지 않는다.
// 높이는 바깥 틀이 정하고 내용 상자(Viewport)가 남은 높이를 채운다. 그래서 max-h만 줘도 그 높이에서 스크롤된다.
export const ScrollArea = ({
  children,
  className,
  contentClassName,
  orientation = 'vertical',
}: ScrollAreaProps) => (
  <BaseScrollArea.Root className={cn('flex min-h-0 flex-col', className)}>
    <BaseScrollArea.Viewport className="min-h-0 flex-1">
      <BaseScrollArea.Content className={contentClassName}>{children}</BaseScrollArea.Content>
    </BaseScrollArea.Viewport>
    {orientation !== 'horizontal' && <Scrollbar orientation="vertical" />}
    {orientation !== 'vertical' && <Scrollbar orientation="horizontal" />}
  </BaseScrollArea.Root>
);
