import { NotFoundPane } from '@datagsm/core/shared/ui/not-found';

// Figma "관리자 / 없는 페이지 (404)"(1760:46678). 관리자의 첫 메뉴인 학생 관리로 보낸다.
export const NotFoundPage = () => (
  <NotFoundPane homeLabel="학생 관리로 이동" homeHref="/students" />
);
