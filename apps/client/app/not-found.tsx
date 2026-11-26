import { ShellLayout } from '@/_app/shell-layout';
import { NotFoundPage } from '@/_pages/not-found';

// 없는 주소는 Next가 루트 not-found로 보내고, 루트 레이아웃만 씌운다.
// 루트 레이아웃에는 사이드바와 공통 배경이 없으므로(랜딩 때문) 여기서 ShellLayout으로 직접 감싼다.
// 이렇게 두면 404가 서버 HTML로 렌더된다. (shell) 안의 catch-all로 받으면 동적 notFound()가 되어 빈 HTML이 나간다.
const NotFound = () => (
  <ShellLayout>
    <NotFoundPage />
  </ShellLayout>
);

export default NotFound;
