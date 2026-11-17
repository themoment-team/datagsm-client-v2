import { expect, it } from 'vitest';

import { createCodeChallenge, createRandomToken } from './pkce';

it('RFC 7636 부록 B의 예시와 같은 code challenge를 만든다', async () => {
  await expect(createCodeChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).resolves.toBe(
    'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
  );
});

it('무작위 토큰은 URL에 그대로 쓸 수 있는 43자 문자열이다', () => {
  const token = createRandomToken();

  expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  expect(createRandomToken()).not.toBe(token);
});
