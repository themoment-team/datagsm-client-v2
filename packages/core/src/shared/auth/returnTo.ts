// 로그인 뒤 돌아갈 경로는 같은 앱 안의 경로만 허용한다. 외부 주소로 보내는 open redirect를 막는다.
export const toSafeReturnTo = (value: string | null | undefined) => {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '/';
  }

  return value;
};
