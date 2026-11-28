import { type Scope, ScopeList } from '@/entities/scope';
import { withSubjectParticle } from '@/shared/lib';
import { AuthWindow } from '@/shared/ui/auth-window';

import { LoginForm, type LoginFormProps } from './LoginForm';

interface LoginPageProps extends LoginFormProps {
  clientName: string;
  scopes: Scope[];
}

// Figma DataGSMv2 "WF/OAuth modal" State=Default(권한 요청·로그인)·Error(로그인 실패)다.
// 창 안 덩어리: request(문구 + 권한 목록, 간격 12) → 폼(LoginForm). 덩어리 사이 16은 AuthWindow가 준다.
// 오류는 error에 문구를 넘기면 Error 상태가 된다. 제출 처리와 세션 카운트다운은 쓰는 쪽이 한다.
export const LoginPage = ({ clientName, scopes, ...formProps }: LoginPageProps) => (
  <AuthWindow title="로그인">
    <div className="flex flex-col gap-3">
      <p className="text-body-16-regular">
        {withSubjectParticle(clientName)} 아래 권한을 요청합니다.
      </p>
      <ScopeList scopes={scopes} />
    </div>
    <LoginForm {...formProps} />
  </AuthWindow>
);
