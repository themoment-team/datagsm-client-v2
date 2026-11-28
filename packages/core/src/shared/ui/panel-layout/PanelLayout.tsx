import { cn } from '@datagsm/core/shared/lib';
import { ScrollArea } from '@datagsm/core/shared/ui/scroll-area';
import { cva, type VariantProps } from 'class-variance-authority';

// 칸 폭은 Figma 1920 화면(사이드바 272 + 본문 1648)의 값을 비율(fr)로 옮긴 것이다. 화면이 좁아지면 같은 비율로 준다.
// minmax(0, …)는 긴 글자가 칸을 넓히지 못하게 한다.
// 최소 폭 1264는 지원하는 가장 좁은 화면 1536(15.6인치 FHD, 125% 배율)에서 사이드바 272를 뺀 본문 폭이다.
// 그보다 좁으면 AppShell 본문이 가로로 스크롤된다.
const panelLayoutVariants = cva('grid h-dvh min-w-[1264px] grid-rows-1', {
  variants: {
    layout: {
      // 관련 문서 · 목록 · 상세
      triple: 'grid-cols-[minmax(0,544fr)_minmax(0,544fr)_minmax(0,560fr)]',
      // triple에서 관련 문서 칸을 접은 상태 (Figma 970:25486, 72 / 788.5 / 787.5).
      // 접힌 칸은 72로 고정되고 나머지 두 칸이 남은 폭을 반씩 나눈다. 첫 칸에는 Panel 대신 접힌 Help panel이 들어간다.
      'triple-collapsed': 'grid-cols-[72px_minmax(0,1fr)_minmax(0,1fr)]',
      // 넓은 본문 · 오른쪽 상세 (관리자 화면 등)
      'main-side': 'grid-cols-[minmax(0,1088fr)_minmax(0,560fr)]',
      // 상태, 내 정보 등
      half: 'grid-cols-2',
      // 불러오기 실패 등
      single: 'grid-cols-1',
      // 문서 목록 · 본문 · 관련 문서
      'docs-toc': 'grid-cols-[minmax(0,320fr)_minmax(0,1088fr)_minmax(0,240fr)]',
      // 문서 목록 · 본문 · 예시 코드
      'docs-example': 'grid-cols-[minmax(0,320fr)_minmax(0,768fr)_minmax(0,560fr)]',
    },
  },
});

interface PanelLayoutProps {
  // 기본값 없이 화면마다 고른다. Figma 화면마다 구성이 다르기 때문이다.
  layout: NonNullable<VariantProps<typeof panelLayoutVariants>['layout']>;
  children: React.ReactNode;
  className?: string;
}

// 사이드바 오른쪽 본문을 칸(Panel)으로 나눈다. 페이지 높이는 화면 높이로 고정되고, 칸마다 따로 스크롤된다.
// 칸 사이 간격은 없다(Figma 화면 398개 모두 칸이 맞붙어 있다).
export const PanelLayout = ({ layout, children, className }: PanelLayoutProps) => (
  <div className={cn(panelLayoutVariants({ layout }), className)}>{children}</div>
);

interface PanelBaseProps {
  // 본문. 칸에서 스크롤되는 부분은 여기뿐이다.
  children: React.ReactNode;
  // 위에 고정되는 부분. 제목 줄(PanelTitle)과 필요하면 그 아래 검색창을 넣는다. 여러 개면 간격 32로 쌓인다.
  header?: React.ReactNode;
  // 본문 아래 부분. 수정·삭제 같은 버튼 줄을 넣는다. 스크롤되지 않는다.
  footer?: React.ReactNode;
  // 본문이 남은 높이를 모두 차지하게 한다. 그러면 바닥은 본문 길이와 상관없이 칸 끝에 고정된다.
  // 관련 문서 칸('문서 사이트에서 열기'), 높이를 재서 행 수를 정하는 관리자 목록 표(안에서 flex-1)가 쓴다.
  fill?: boolean;
  // 칸 바깥(section)에 붙는다.
  className?: string;
}

// 칸 이름은 반드시 하나를 받는다. 이름 없는 section은 랜드마크로 노출되지 않아 보조기기가 칸을 구분하지 못한다.
// 보통은 PanelTitle의 id를 aria-labelledby로 넘기고, 제목이 없는 칸만 aria-label을 쓴다.
type PanelLabelProps =
  | { 'aria-labelledby': string; 'aria-label'?: never }
  | { 'aria-label': string; 'aria-labelledby'?: never };

type PanelProps = PanelBaseProps & PanelLabelProps;

// PanelLayout의 칸 하나다. 머리는 위에 고정되고 본문만 스크롤된다 (Figma 1046:41776, 디자이너 확인).
// 바닥은 본문 바로 아래에 온다. 본문이 넘치면 본문이 줄어들며 스크롤되고 바닥은 칸 끝에 남는다 (Figma 칸 78개).
// fill이면 본문이 늘 남은 높이를 채워서 바닥이 처음부터 칸 끝에 있다.
// 안쪽 여백 24와 머리·본문·바닥 사이 간격 32는 모든 칸이 같은 값이다.
// 본문 스크롤 영역은 칸 폭 전체를 써서 막대가 오른쪽 여백 안(끝에서 12px)에 온다.
export const Panel = ({
  children,
  header,
  footer,
  fill = false,
  className,
  ...labelProps
}: PanelProps) => (
  <section className={cn('flex min-h-0 min-w-0 flex-col gap-8 py-6', className)} {...labelProps}>
    {header && <div className="flex shrink-0 flex-col gap-8 px-6">{header}</div>}
    <ScrollArea
      scrollbarInset="panel"
      className={fill ? 'flex-1' : undefined}
      // 본문 안 간격은 화면마다 다르므로(Figma 8, 24 등) 정하지 않는다.
      contentClassName={cn('flex flex-col px-6', fill && 'min-h-full')}
    >
      {children}
    </ScrollArea>
    {footer && <div className="shrink-0 px-6">{footer}</div>}
  </section>
);
