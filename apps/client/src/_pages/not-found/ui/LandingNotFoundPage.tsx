import { buttonVariants } from '@datagsm/core/shared/ui/button';
import { NotFoundCard, NotFoundLink } from '@datagsm/core/shared/ui/not-found';

// 콘솔 밖의 없는 주소에 보여 주는 404다. 랜딩처럼 사이드바 없이 가운데 카드로 보여 주고 랜딩으로 보낸다.
// 모양은 Figma "케이스 / OAuth · 없는 페이지 (404)"(1760:46829)를 따른다(디자이너 확인).
// 그 화면의 둘째 문장(로그인은 사용하던 서비스에서 다시 시작)은 OAuth 전용이라 콘솔 404의 문구를 쓴다.
export const LandingNotFoundPage = () => (
  <NotFoundCard
    title="페이지를 찾을 수 없습니다"
    description="주소가 바뀌었거나 삭제된 페이지입니다. 주소를 확인하세요."
  >
    <NotFoundLink href="/" className={buttonVariants({ variant: 'secondary' })}>
      DataGSM으로 이동
    </NotFoundLink>
  </NotFoundCard>
);
