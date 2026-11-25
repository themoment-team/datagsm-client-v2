'use client';

import { SessionTimer } from '@datagsm/core/entities/auth-session';
import { Button } from '@datagsm/core/shared/ui/button';
import { TextLink } from '@datagsm/core/shared/ui/text-button';
import { TextField } from '@datagsm/core/shared/ui/text-field';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { EMAIL_DOMAIN, type LoginRequest, LoginSchema } from '../model/loginSchema';

export interface LoginFormProps {
  sessionRemainingSeconds: number;
  error?: string;
  signUpHref: string;
  resetPasswordHref: string;
  onSubmit: (values: LoginRequest) => void;
}

// Figma "WF/OAuth modal"의 form(입력칸 두 개, 간격 8) → session → footer(전체폭 로그인 버튼, 글자 링크 두 개)다.
// 셋을 form 하나로 묶고 창과 같은 16 간격을 다시 준다.
// Error 상태(로그인 실패)는 Figma대로 비밀번호 칸에만 오류 선과 문구를 둔다. 빈 값 오류가 있으면 그 문구가 먼저다.
export const LoginForm = ({
  sessionRemainingSeconds,
  error,
  signUpHref,
  resetPasswordHref,
  onSubmit,
}: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: { emailId: '', password: '' },
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <div className="flex flex-col gap-2">
        <TextField
          {...register('emailId')}
          type="text"
          autoComplete="username"
          aria-label="이메일 아이디"
          placeholder="이메일 아이디를 입력하세요"
          suffix={EMAIL_DOMAIN}
          error={errors.emailId?.message}
        />
        <TextField
          {...register('password')}
          type="password"
          autoComplete="current-password"
          aria-label="비밀번호"
          placeholder="비밀번호를 입력하세요"
          error={errors.password?.message ?? error}
        />
      </div>
      <SessionTimer remainingSeconds={sessionRemainingSeconds} />
      <div className="flex flex-col gap-4">
        <Button type="submit" className="w-full">
          로그인
        </Button>
        <div className="flex gap-4">
          <TextLink href={signUpHref}>회원가입</TextLink>
          <TextLink href={resetPasswordHref}>비밀번호 찾기</TextLink>
        </div>
      </div>
    </form>
  );
};
