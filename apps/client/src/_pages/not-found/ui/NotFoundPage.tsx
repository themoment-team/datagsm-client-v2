import { NotFoundPane } from '@datagsm/core/shared/ui/not-found';

// 사이드바가 있는 콘솔 화면의 404다(Figma 1760:46552). 콘솔 경로 아래의 없는 주소와 (shell) 안 페이지의 notFound()가 쓴다.
export const NotFoundPage = () => (
  <NotFoundPane homeLabel="애플리케이션으로 이동" homeHref="/applications" />
);
