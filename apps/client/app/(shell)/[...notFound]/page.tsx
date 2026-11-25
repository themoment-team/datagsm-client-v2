import { notFound } from 'next/navigation';

// 없는 주소는 루트 app/not-found로 가는데, 그곳은 루트 레이아웃만 써서 사이드바와 배경이 없다.
// 그래서 (shell) 안의 catch-all로 받아 (shell)/not-found를 띄운다. 실제 라우트와 /api/*가 이것보다 먼저 맞는다.
const ShellNotFound = () => notFound();

export default ShellNotFound;
