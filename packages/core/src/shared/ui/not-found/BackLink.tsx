'use client';

import type { MouseEvent, ReactNode } from 'react';

interface BackLinkProps {
  // 돌아갈 기록이 없을 때(주소를 직접 열었거나 새 탭으로 열었을 때) 갈 곳이다.
  fallbackHref: string;
  className: string;
  children: ReactNode;
}

// '이전 페이지' 버튼이다. 기록이 있으면 브라우저 뒤로 가기를 하고, 없으면 fallbackHref로 간다.
// 기록이 없을 때 그냥 history.back()을 부르면 아무 일도 일어나지 않아 사용자가 막힌다.
// 기본 동작이 fallbackHref로 가는 링크라서, 스크립트가 아직 실행되지 않았어도 누르면 이동한다.
export const BackLink = ({ fallbackHref, className, children }: BackLinkProps) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (window.history.length <= 1) return;

    event.preventDefault();
    window.history.back();
  };

  return (
    <a href={fallbackHref} className={className} onClick={handleClick}>
      {children}
    </a>
  );
};
