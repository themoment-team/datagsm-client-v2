import { expect, it } from 'vitest';

import { LoginSchema } from './loginSchema';

it('아이디에 학교 도메인을 붙여 email로 내보낸다', () => {
  expect(LoginSchema.parse({ emailId: ' s25008 ', password: 'pw' })).toEqual({
    email: 's25008@gsm.hs.kr',
    password: 'pw',
  });
});

it('아이디가 비었거나 공백뿐이면 오류다', () => {
  const result = LoginSchema.safeParse({ emailId: '   ', password: 'pw' });

  expect(result.success).toBe(false);
  expect(result.error?.issues[0]).toMatchObject({
    path: ['emailId'],
    message: '이메일 아이디를 입력하세요',
  });
});

it('비밀번호가 비면 오류다', () => {
  const result = LoginSchema.safeParse({ emailId: 's25008', password: '' });

  expect(result.success).toBe(false);
  expect(result.error?.issues[0]).toMatchObject({
    path: ['password'],
    message: '비밀번호를 입력하세요',
  });
});
