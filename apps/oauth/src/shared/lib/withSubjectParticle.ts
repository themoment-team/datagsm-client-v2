// 이름 뒤에 주격 조사(이/가)를 붙인다. 서비스 이름은 사용자가 정하는 값이라 받침에 맞춰 고른다.
// 한글로 끝나지 않으면(영문·숫자) 읽는 법을 알 수 없어 "이(가)"로 둔다.
export const withSubjectParticle = (name: string) => {
  const code = name.charCodeAt(name.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${name}이(가)`;
  return `${name}${code % 28 === 0 ? '가' : '이'}`;
};
