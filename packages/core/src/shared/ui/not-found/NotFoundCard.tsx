import { Brand } from '@datagsm/core/shared/ui/brand';
import type { ReactNode } from 'react';

import { NotFoundHeading } from './NotFoundHeading';

interface NotFoundCardProps {
  title: string;
  description: string;
  // 안내 문구 아래에 간격 16으로 온다. 이동 버튼이나 요청한 client_id 줄을 넣는다.
  children?: ReactNode;
}

// Figma DataGSMv2 "케이스 / OAuth · 없는 페이지 (404)"(1760:46829)와 "등록되지 않은 서비스 (404)"(1760:46843)의 카드다.
// 사이드바 없이 화면 전체에 scrim을 깔고 가운데에 528 카드를 둔다. client의 콘솔 밖 없는 주소도 이 모양을 쓴다.
// 창 모양(scrim, 글래스, 테두리, 간격 16)은 oauth 앱의 AuthWindow와 같은 Figma 값이다. 하나를 바꾸면 다른 쪽도 함께 바꾼다.
export const NotFoundCard = ({ title, description, children }: NotFoundCardProps) => (
  <main className="flex min-h-dvh items-center justify-center bg-scrim p-4">
    <section className="flex w-full max-w-132 flex-col gap-4 overflow-clip rounded bg-glass-fill p-6 text-foreground inset-ring inset-ring-glass-line backdrop-blur-glass">
      <Brand padding="none" />
      <NotFoundHeading size="card" title={title} />
      <p className="text-body-16-regular text-foreground-muted">{description}</p>
      {children}
    </section>
  </main>
);
