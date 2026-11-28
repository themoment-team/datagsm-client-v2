'use client';

import { type FormEvent, type ReactNode, useState } from 'react';

import { LOGOUT_PATH } from '@datagsm/core/shared/auth';

import { endIdpSession } from '../api/endIdpSession';

interface LogoutButtonProps {
  // 인가 서버의 SSO 로그아웃 주소다. 서버 컴포넌트에서 buildIdpLogoutUrl(env)로 만들어 넘긴다.
  idpLogoutUrl: string;
  className?: string;
  // 버튼 내용이다. 아이콘을 함께 둘 때 넘긴다. 접근 가능한 이름이 '로그아웃'이 되도록 글자를 넣는다.
  children?: ReactNode;
}

// 로그아웃은 두 단계다.
// 1. 브라우저가 인가 서버의 SSO 세션을 끝낸다. 다른 앱도 다음 로그인에서 로그인 화면을 거치게 된다.
// 2. 이 앱의 POST /api/logout으로 토큰 쿠키를 지우고 홈으로 이동한다.
// JS가 동작하지 않아도 form 제출로 2단계는 실행된다.
export const LogoutButton = ({
  idpLogoutUrl,
  className,
  children = '로그아웃',
}: LogoutButtonProps) => {
  const [pending, setPending] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    setPending(true);
    // submit()은 onSubmit을 다시 부르지 않고 form을 그대로 제출한다.
    void endIdpSession(idpLogoutUrl).then(() => form.submit());
  };

  return (
    <form method="post" action={LOGOUT_PATH} onSubmit={handleSubmit}>
      <button type="submit" className={className} disabled={pending}>
        {children}
      </button>
    </form>
  );
};
