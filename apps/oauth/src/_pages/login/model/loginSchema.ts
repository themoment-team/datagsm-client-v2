import { z } from 'zod';

// 학교 계정 도메인이다. 입력칸은 아이디만 받고 이 값을 칸 안 오른쪽에 고정으로 보여 준다.
export const EMAIL_DOMAIN = '@gsm.hs.kr';

// 이메일 전체를 붙여 넣는 경우가 있어 학교 도메인으로 끝나면 떼어 내고 아이디만 남긴다. 도메인은 대소문자를 가리지 않는다.
const stripEmailDomain = (value: string) =>
  value.toLowerCase().endsWith(EMAIL_DOMAIN) ? value.slice(0, -EMAIL_DOMAIN.length) : value;

// 폼 값은 아이디(emailId)와 비밀번호이고, 제출 값은 도메인을 붙인 email과 비밀번호다.
// 도메인을 떼고도 @가 남으면 다른 도메인의 이메일이라 아이디만 입력하게 한다.
export const LoginSchema = z
  .object({
    emailId: z
      .string()
      .trim()
      .transform(stripEmailDomain)
      .pipe(
        z
          .string()
          .trim()
          .min(1, '이메일 아이디를 입력하세요')
          .refine((value) => !value.includes('@'), '아이디만 입력하세요'),
      ),
    password: z.string().min(1, '비밀번호를 입력하세요'),
  })
  .transform(({ emailId, password }) => ({ email: `${emailId}${EMAIL_DOMAIN}`, password }));

export type LoginRequest = z.output<typeof LoginSchema>;
