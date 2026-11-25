import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib';
import { ScrollArea } from '../scroll-area';

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

interface PanelProps {
  children: React.ReactNode;
  // 칸 바깥(section)에 붙는다.
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

// PanelLayout의 칸 하나다. 제목까지 포함한 내용 전체가 이 칸 안에서 스크롤된다.
// 안쪽 여백 24와 세로 간격 32는 Figma 화면의 모든 칸이 같은 값이다.
export const Panel = ({ children, className, ...labelProps }: PanelProps) => (
  <section className={cn('min-h-0 min-w-0', className)} {...labelProps}>
    <ScrollArea className="h-full" contentClassName="flex flex-col gap-8 p-6">
      {children}
    </ScrollArea>
  </section>
);
