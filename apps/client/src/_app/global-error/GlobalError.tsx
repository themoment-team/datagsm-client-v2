'use client';

import { ErrorPage, type ErrorPageProps } from '@/_pages/error';

import '../styles/globals.css';

// 루트 레이아웃 대신 그려지므로 셸이 없다. ErrorPage가 높이를 채우도록(flex-1) body를 화면 높이의 세로 flex로 둔다.
export const GlobalError = ({ error, retry }: ErrorPageProps) => (
  <html lang="ko">
    <body className="flex min-h-dvh flex-col">
      <title>오류가 발생했습니다</title>
      <ErrorPage error={error} retry={retry} />
    </body>
  </html>
);
