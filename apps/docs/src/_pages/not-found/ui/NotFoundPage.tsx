import { NotFoundPane } from '@datagsm/core/shared/ui/not-found';

interface NotFoundPageProps {
  // client 앱 주소(APP_CLIENT_URL, 끝의 / 없음). 서버의 app/not-found.tsx가 env에서 꺼내 넘긴다.
  clientUrl: string;
}

// Figma "케이스 / 공통 · 없는 페이지 (404)"(1760:46552). 애플리케이션은 client 앱 화면이라 그 주소로 보낸다.
export const NotFoundPage = ({ clientUrl }: NotFoundPageProps) => (
  <NotFoundPane homeLabel="애플리케이션으로 이동" homeHref={`${clientUrl}/applications`} />
);
