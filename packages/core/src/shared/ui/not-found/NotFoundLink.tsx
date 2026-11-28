import Link from 'next/link';

import type { ReactNode } from 'react';

interface NotFoundLinkProps {
  href: string;
  className: string;
  children: ReactNode;
}

// 404 화면의 이동 버튼은 같은 앱 경로일 수도, 다른 앱 주소일 수도 있다.
// 다른 앱은 다른 배포라서 Link의 앱 안 이동과 prefetch가 동작하지 않으므로 절대 주소면 <a>로 그린다.
export const NotFoundLink = ({ href, className, children }: NotFoundLinkProps) =>
  /^https?:\/\//.test(href) ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
