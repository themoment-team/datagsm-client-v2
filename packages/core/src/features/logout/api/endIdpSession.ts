// 인가 서버의 SSO 세션을 끝낸다. 세션이 없어도 204다.
// 실패해도(네트워크 오류, CORS 거부, 시간 초과) 앱 로그아웃은 이어서 해야 하므로 오류를 던지지 않는다.
// 로컬(localhost → 인가 서버)은 다른 사이트라 SameSite=Lax 세션 쿠키가 실리지 않아 세션이 남는다.
export const endIdpSession = async (idpLogoutUrl: string) => {
  try {
    await fetch(idpLogoutUrl, {
      method: 'POST',
      credentials: 'include',
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // 앱 로그아웃은 계속한다.
  }
};
