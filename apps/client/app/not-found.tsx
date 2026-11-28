import { connection } from 'next/server';

import { ShellLayout } from '@/_app/shell-layout';
import { LandingNotFoundPage, NotFoundPage, NotFoundSwitch } from '@/_pages/not-found';

// 없는 주소는 Next가 루트 not-found로 보내고, 루트 레이아웃만 씌운다.
// 콘솔 경로 아래의 없는 주소는 사이드바 404, 그 밖은 랜딩처럼 사이드바 없는 카드 404다(NotFoundSwitch).
// 루트 레이아웃에는 사이드바와 공통 배경이 없으므로(랜딩 때문) 콘솔 404는 여기서 ShellLayout으로 직접 감싼다.
// 이렇게 두면 404가 서버 HTML로 렌더된다. (shell) 안의 catch-all로 받으면 동적 notFound()가 되어 빈 HTML이 나간다.
// connection()으로 요청마다 렌더한다. 정적으로 미리 렌더하면 /_not-found 주소로 한 번만 그려져, 콘솔 경로에서도 카드 404 HTML이 나간 뒤 브라우저에서 바뀐다.
const NotFound = async () => {
  await connection();

  return (
    <NotFoundSwitch
      console={
        <ShellLayout>
          <NotFoundPage />
        </ShellLayout>
      }
      landing={<LandingNotFoundPage />}
    />
  );
};

export default NotFound;
