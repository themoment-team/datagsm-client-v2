import { cn } from '@datagsm/core/shared/lib';
import { buttonVariants } from '@datagsm/core/shared/ui/button';

import { BackLink } from './BackLink';
import { NotFoundHeading } from './NotFoundHeading';
import { NotFoundLink } from './NotFoundLink';

interface NotFoundPaneProps {
  // 주 버튼 글자와 갈 곳. 같은 앱 경로('/students')나 다른 앱 주소('https://datagsm.kr/applications')를 받는다.
  // '이전 페이지'도 돌아갈 기록이 없으면 이 주소로 간다.
  homeLabel: string;
  homeHref: string;
}

// Figma DataGSMv2 "케이스 / 공통 · 없는 페이지 (404)"(1760:46552)와 "관리자 / 없는 페이지 (404)"(1760:46678)의 본문 칸이다.
// 사이드바(AppShell) 안에서 본문 전체를 글래스 칸 하나로 채우고, 가운데에 폭 528의 안내를 둔다.
// 두 화면은 주 버튼(애플리케이션으로 이동 / 학생 관리로 이동)만 다르다. 두 버튼은 같은 폭(260)이다.
export const NotFoundPane = ({ homeLabel, homeHref }: NotFoundPaneProps) => (
  <main className="flex flex-1 items-center justify-center bg-glass-fill p-6 text-foreground backdrop-blur-glass">
    <div className="flex w-132 max-w-full flex-col gap-6">
      <NotFoundHeading size="pane" title="페이지를 찾을 수 없습니다" />
      <p className="text-body-16-regular text-foreground-muted">
        주소가 바뀌었거나 삭제된 페이지입니다. 주소를 확인하세요.
      </p>
      <div className="flex gap-2">
        <NotFoundLink href={homeHref} className={cn(buttonVariants(), 'flex-1')}>
          {homeLabel}
        </NotFoundLink>
        <BackLink
          fallbackHref={homeHref}
          className={cn(buttonVariants({ variant: 'secondary' }), 'flex-1')}
        >
          이전 페이지
        </BackLink>
      </div>
    </div>
  </main>
);
