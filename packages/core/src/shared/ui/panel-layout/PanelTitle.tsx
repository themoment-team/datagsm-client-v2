import { cn } from '@datagsm/core/shared/lib';

interface PanelTitleProps {
  // 제목 글자.
  children: React.ReactNode;
  // Panel의 aria-labelledby에 넘겨 칸 이름으로 쓴다.
  id?: string;
  // 화면의 대표 제목이면 h1, 나머지 칸은 h2다.
  as?: 'h1' | 'h2';
  // 제목 바로 옆(간격 8)에 붙는 배지, 단계 표시, 상태 같은 것.
  adornment?: React.ReactNode;
  // 오른쪽 끝 버튼들. 버튼 사이 간격은 16이다.
  actions?: React.ReactNode;
  className?: string;
}

// Panel 머리의 제목 줄이다 (Figma 칸 581개 공통: 제목 32, 줄 높이 40, 버튼과 간격 16, 제목 옆 요소와 간격 8).
// 제목이 길어 두 줄이 되어도 버튼은 위쪽 줄에 맞춘다 (Figma 884:12602).
// 관련 문서 칸의 제목(24, 접기 버튼)은 Help panel이 따로 그린다.
export const PanelTitle = ({
  children,
  id,
  as: Heading = 'h2',
  adornment,
  actions,
  className,
}: PanelTitleProps) => (
  <div className={cn('flex items-start gap-4', className)}>
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <Heading id={id} className="text-title-32 text-foreground">
        {children}
      </Heading>
      {adornment}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-4">{actions}</div>}
  </div>
);
