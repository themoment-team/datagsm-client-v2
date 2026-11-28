import { buttonVariants } from '@datagsm/core/shared/ui/button';
import { NotFoundCard, NotFoundLink } from '@datagsm/core/shared/ui/not-found';

interface NotFoundPageProps {
  // client 앱 주소(APP_CLIENT_URL). 서버의 app/not-found.tsx가 env에서 꺼내 넘긴다.
  clientUrl: string;
}

// Figma "케이스 / OAuth · 없는 페이지 (404)"(1760:46829).
export const NotFoundPage = ({ clientUrl }: NotFoundPageProps) => (
  <NotFoundCard
    title="페이지를 찾을 수 없습니다"
    description="주소를 확인하세요. 로그인은 사용하던 서비스에서 다시 시작하세요."
  >
    <NotFoundLink href={clientUrl} className={buttonVariants({ variant: 'secondary' })}>
      DataGSM으로 이동
    </NotFoundLink>
  </NotFoundCard>
);
