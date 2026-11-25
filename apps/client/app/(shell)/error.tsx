'use client';

// (shell) 안의 페이지 오류는 사이드바와 공통 배경을 유지한 채 보여 준다.
// 루트 app/error.tsx는 랜딩 등 (shell) 밖의 오류만 받는다.
export { ErrorPage as default } from '@/_pages/error';
