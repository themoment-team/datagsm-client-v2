import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import { cn } from '@datagsm/core/shared/lib';

type ScrollOrientation = 'vertical' | 'horizontal' | 'both';

interface ScrollAreaProps {
  children: React.ReactNode;
  // 바깥 틀(크기)에 붙는다. 높이를 정하는 h-full, max-h-[280px] 같은 클래스를 여기에 넘긴다.
  className?: string;
  // 스크롤되는 내용 상자에 붙는다. 안쪽 여백과 배치(flex, gap)를 여기에 넘긴다.
  contentClassName?: string;
  // 스크롤할 축. 막대를 어느 축에 그릴지와 함께, 고르지 않은 축은 스크롤되지 않게 막는다.
  orientation?: ScrollOrientation;
  // 세로 막대를 끝에서 얼마나 안쪽에 둘지 정한다. 가로 막대는 언제나 아래에서 4px 안쪽이다.
  // inner: 4px. 표 본문, 선택 목록처럼 내용 바로 옆에 붙는 스크롤 영역 (Figma 1402:58107)
  // panel: 12px. 칸 본문. 칸의 오른쪽 여백 24 안에 들어가 내용과 8px 떨어진다 (Figma 1046:41776)
  scrollbarInset?: 'inner' | 'panel';
  // 스크롤 영역의 이름. 주면 스크롤되는 상자가 이름 있는 영역(region)이 되어 보조기기에서 찾을 수 있다.
  // 키보드 포커스(tabIndex)는 Base UI가 내용이 넘칠 때 스스로 준다.
  label?: string;
}

// Figma DataGSMv2 "WF/Scrollbar"(node 1366:479). 폭 4, 모서리 2, 트랙 wf/line, 막대 wf/text-muted.
// 내용이 넘칠 때만 생기고, 막대 길이는 보이는 비율을 따른다. 내용 위에 겹쳐 그린다.
const Scrollbar = ({
  orientation,
  inset,
}: {
  orientation: 'vertical' | 'horizontal';
  inset: 'inner' | 'panel';
}) => (
  <BaseScrollArea.Scrollbar
    orientation={orientation}
    className={cn(
      'flex rounded-xs bg-line',
      orientation === 'vertical' && 'w-1 justify-center',
      orientation === 'vertical' && (inset === 'panel' ? 'me-3' : 'me-1'),
      orientation === 'horizontal' && 'mb-1 h-1 flex-col justify-center',
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
// Base UI Viewport는 인라인 스타일로 두 축 모두 overflow: scroll이고 Root에는 축을 정하는 prop이 없다.
// 그대로 두면 세로만 쓰는 영역도 내용이 넓으면 막대 없이 가로로 밀리므로, 고르지 않은 축을 !important로 막는다.
// Content도 인라인 스타일로 min-width: fit-content라서 세로 영역에서는 긴 URL·코드 블록만큼 넓어져 잘리고 truncate가 듣지 않는다.
// 그래서 세로 영역은 내용 상자를 영역 폭에 맞춘다(min-w-0!). 가로로 스크롤되는 영역은 이 동작이 있어야 넘친 폭을 잰다.
export const ScrollArea = ({
  children,
  className,
  contentClassName,
  orientation = 'vertical',
  scrollbarInset = 'inner',
  label,
}: ScrollAreaProps) => (
  <BaseScrollArea.Root className={cn('flex min-h-0 flex-col', className)}>
    <BaseScrollArea.Viewport
      className={cn(
        'min-h-0 flex-1',
        orientation === 'vertical' && 'overflow-x-hidden!',
        orientation === 'horizontal' && 'overflow-y-hidden!',
      )}
      {...(label && { role: 'region', 'aria-label': label })}
    >
      <BaseScrollArea.Content
        className={cn(orientation === 'vertical' && 'min-w-0!', contentClassName)}
      >
        {children}
      </BaseScrollArea.Content>
    </BaseScrollArea.Viewport>
    {orientation !== 'horizontal' && <Scrollbar orientation="vertical" inset={scrollbarInset} />}
    {orientation !== 'vertical' && <Scrollbar orientation="horizontal" inset={scrollbarInset} />}
  </BaseScrollArea.Root>
);
