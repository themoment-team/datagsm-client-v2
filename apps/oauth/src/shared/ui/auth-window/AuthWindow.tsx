import { cn } from '@datagsm/core/shared/lib';
import { Brand } from '@datagsm/core/shared/ui/brand';
import type { ReactNode } from 'react';

interface AuthWindowProps {
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}

// Figma DataGSMv2 "WF/OAuth modal"(node 781:2226)의 공통 틀이다. 로그인·동의·만료 등 인증 창이 모두 이 모양이다.
// 화면 전체에 scrim을 깔고 가운데에 528px 창을 둔다. Dark의 scrim은 투명이라 배경이 그대로 보인다.
// 창 안은 Brand, 제목(h1), children 순서로 16 간격이다. Figma 설명은 "간격 24"지만 일곱 상태의 실제 값이 모두 16이라 16을 따른다.
// children은 창의 flex 항목으로 바로 들어가므로 덩어리(안내 문구, 목록, 폼, 버튼 줄)를 형제로 넘기면 16 간격이 생긴다.
// 글래스는 WF/Glass(GLASS radius 36)를 배경 흐림으로 옮겼다. Figma 흐림 반경은 CSS blur의 두 배라 18에 가까운 backdrop-blur-lg(16)를 쓴다.
export const AuthWindow = ({ title, children, className }: AuthWindowProps) => (
  <main className="flex min-h-dvh items-center justify-center bg-scrim p-4">
    <section
      className={cn(
        'flex w-full max-w-132 flex-col gap-4 overflow-clip rounded border border-glass-line bg-glass-fill p-6 text-foreground backdrop-blur-lg',
        className,
      )}
    >
      <Brand padding="none" />
      <h1 className="text-title-24">{title}</h1>
      {children}
    </section>
  </main>
);
