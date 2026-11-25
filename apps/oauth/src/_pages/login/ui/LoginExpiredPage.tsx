import { AuthWindow } from '@/shared/ui/auth-window';

// Figma DataGSMv2 "WF/OAuth modal" State=Expired(인증 세션 만료)다. 제목과 본문만 있다.
// 본문은 Figma의 두 줄을 줄바꿈으로 유지한다.
export const LoginExpiredPage = () => (
  <AuthWindow title="인증 세션이 만료되었습니다">
    <p className="text-body-16-regular text-foreground-muted">
      보안을 위해 인증 세션을 끝냈습니다.
      <br />이 창을 닫고 서비스에서 다시 로그인하세요.
    </p>
  </AuthWindow>
);
