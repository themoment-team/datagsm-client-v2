'use client';

import { type FormEvent, useState } from 'react';

import { formatRemainingTime, SessionTimer } from '../../../entities/auth-session';
import { Button } from '../../../shared/ui/button';
import { TextButton } from '../../../shared/ui/text-button';
import { TextField } from '../../../shared/ui/text-field';

export type EmailCodeState = 'email-code' | 'verifying' | 'code-mismatch' | 'code-expired';

interface EmailCodeFormProps {
  state: EmailCodeState;
  email: string;
  codeRemainingSeconds: number;
  sessionRemainingSeconds: number;
  onSubmitCode: (code: string) => void;
  onResendCode: () => void;
  onSelectFingerprint: () => void;
  className?: string;
}

const ERROR_MESSAGES: Partial<Record<EmailCodeState, string>> = {
  'code-mismatch': '인증 코드가 맞지 않습니다',
  'code-expired': '인증 시간이 지났습니다. 코드를 다시 받으세요',
};

// WF/MFA의 이메일 코드 단계(이메일 코드·이메일 코드 입력·인증하는 중·코드 불일치·코드 만료).
// 입력한 코드는 이 컴포넌트가 들고 있다가 제출할 때 onSubmitCode로 넘긴다.
// 이 단계 안에서 state가 바뀌어도 같은 요소라 입력값이 남고(Figma 코드 불일치도 값을 남긴다),
// 지문 단계로 나가면 함께 사라진다. 코드를 다시 받으면 입력값을 비운다.
export const EmailCodeForm = ({
  state,
  email,
  codeRemainingSeconds,
  sessionRemainingSeconds,
  onSubmitCode,
  onResendCode,
  onSelectFingerprint,
  className,
}: EmailCodeFormProps) => {
  const [code, setCode] = useState('');
  const verifying = state === 'verifying';
  const expired = state === 'code-expired';
  const trimmedCode = code.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedCode || verifying || expired) return;
    onSubmitCode(trimmedCode);
  };

  const handleResend = () => {
    setCode('');
    onResendCode();
  };

  return (
    <form className={className} onSubmit={handleSubmit}>
      <p className="text-body-16-regular text-foreground">{email}로 인증 코드를 보냈습니다.</p>
      {/* 방법을 고른 버튼이 사라지므로 포커스를 입력칸으로 옮긴다(Figma 이메일 코드도 Focus 상태다). */}
      <TextField
        aria-label="인증 코드"
        name="code"
        placeholder="메일로 받은 코드를 입력하세요"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        value={code}
        onChange={(event) => setCode(event.target.value)}
        disabled={verifying}
        error={ERROR_MESSAGES[state]}
        // 코드가 만료되면 남은 시간을 지운다(Figma 코드 만료).
        trailing={expired ? undefined : formatRemainingTime(codeRemainingSeconds)}
      />
      <SessionTimer remainingSeconds={sessionRemainingSeconds} />
      <div className="flex flex-col gap-4">
        <Button type="submit" className="w-full" disabled={!trimmedCode || verifying || expired}>
          {verifying ? '인증하는 중' : '인증'}
        </Button>
        <div className="flex gap-4">
          <TextButton onClick={handleResend}>코드 다시 받기</TextButton>
          <TextButton onClick={onSelectFingerprint}>지문으로 인증</TextButton>
        </div>
      </div>
    </form>
  );
};
