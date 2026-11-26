'use client';

import { ErrorPage, type ErrorPageProps } from '@/_pages/error';

// 랜딩 등 (shell) 밖의 오류만 받는다. 셸 안 오류는 app/(shell)/error.tsx가 받는다.
// ErrorPage는 셸 본문 높이를 채우도록(flex-1) 되어 있으므로, 셸이 없는 여기서는 화면 높이 틀을 직접 씌운다.
const RootError = (props: ErrorPageProps) => (
  <div className="flex min-h-dvh flex-col">
    <ErrorPage {...props} />
  </div>
);

export default RootError;
