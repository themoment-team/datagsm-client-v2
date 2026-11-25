'use client';

import { type FormEvent, useState } from 'react';

import { formatRemainingTime, SessionTimer } from '../../../entities/auth-session';
import { Button } from '../../../shared/ui/button';
import { TextButton } from '../../../shared/ui/text-button';
import { TextField } from '../../../shared/ui/text-field';
import { MfaStepLayout } from './MfaStepLayout';

// idle은 Figma "이메일 코드"·"이메일 코드 입력"이다. 둘은 입력칸이 비었는지만 달라서
// 이 컴포넌트가 입력값으로 가른다(비었으면 인증 버튼이 Disabled 모양).
export type MfaEmailStatus =
  | 'idle'
  | 'verifying' // 인증하는 중
  | 'mismatch' // 코드 불일치
  | 'expired'; // 코드 만료

interface MfaEmailStepProps {
  // 인증 코드를 보낸 주소. 안내 문구에 쓴다.
  email: string;
  status: MfaEmailStatus;
  // 인증 코드의 남은 초. 카운트다운은 쓰는 쪽이 값을 갱신해서 한다.
  codeRemainingSeconds: number;
  // 세션의 남은 초. 넘기지 않으면 세션 줄을 그리지 않는다(세션이 없는 화면).
  sessionRemainingSeconds?: number;
  onSubmitCode: (code: string) => void;
  onResendCode: () => void;
  // 지문 인증으로 넘어간다. 넘기지 않으면 "지문으로 인증"을 그리지 않는다(이메일만 쓰는 화면).
  onSelectFingerprint?: () => void;
  className?: string;
}

const ERROR_MESSAGES: Partial<Record<MfaEmailStatus, string>> = {
  mismatch: '인증 코드가 맞지 않습니다',
  expired: '인증 시간이 지났습니다. 코드를 다시 받으세요',
};

// Figma DataGSMv2 "WF/MFA"의 이메일 코드 단계(이메일 코드·이메일 코드 입력·인증하는 중·코드 불일치·코드 만료)다.
// 코드 확인과 재전송 요청은 쓰는 쪽이 콜백에서 하고 결과를 status로 넘긴다.
// 입력한 코드는 이 컴포넌트가 들고 있다가 제출할 때 앞뒤 공백을 지워 onSubmitCode로 넘긴다.
// status만 바꿔 다시 그리면 같은 요소라 입력값이 남고(Figma 코드 불일치도 값을 남긴다),
// 다른 단계로 바꾸면 함께 사라진다. 코드를 다시 받으면 입력값을 비운다.
export const MfaEmailStep = ({
  email,
  status,
  codeRemainingSeconds,
  sessionRemainingSeconds,
  onSubmitCode,
  onResendCode,
  onSelectFingerprint,
  className,
}: MfaEmailStepProps) => {
  const [code, setCode] = useState('');
  const verifying = status === 'verifying';
  const expired = status === 'expired';
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
    <MfaStepLayout className={className}>
      {/* contents라서 form의 자식이 바깥 틀의 블록 간격을 그대로 받는다. */}
      <form className="contents" onSubmit={handleSubmit}>
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
          error={ERROR_MESSAGES[status]}
          // 코드가 만료되면 남은 시간을 지운다(Figma 코드 만료).
          trailing={expired ? undefined : formatRemainingTime(codeRemainingSeconds)}
        />
        {sessionRemainingSeconds !== undefined && (
          <SessionTimer remainingSeconds={sessionRemainingSeconds} />
        )}
        <div className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={!trimmedCode || verifying || expired}>
            {verifying ? '인증하는 중' : '인증'}
          </Button>
          <div className="flex gap-4">
            <TextButton onClick={handleResend}>코드 다시 받기</TextButton>
            {onSelectFingerprint && (
              <TextButton onClick={onSelectFingerprint}>지문으로 인증</TextButton>
            )}
          </div>
        </div>
      </form>
    </MfaStepLayout>
  );
};
