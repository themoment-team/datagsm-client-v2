// (shell) 안의 페이지가 notFound()를 부르면 이미 ShellLayout 안이므로 404 내용만 보여 준다.
// 없는 주소(어떤 라우트에도 맞지 않는 주소)는 루트 app/not-found.tsx가 받는다.
export { NotFoundPage as default } from '@/_pages/not-found';
