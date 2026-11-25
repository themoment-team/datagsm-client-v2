import { useId } from 'react';

import { cn } from '../../../shared/lib';
import { Button } from '../../../shared/ui/button';
import { FingerprintIcon, MailIcon } from '../../../shared/ui/icon';
import { EmailCodeForm, type EmailCodeState } from './EmailCodeForm';
import { FingerprintStatus } from './FingerprintStatus';

// Figma "WF/MFA"의 State와 1:1이다. 단, "이메일 코드"와 "이메일 코드 입력"은 입력칸이 비었는지만 달라서
// 둘 다 'email-code'다(비었으면 인증 버튼이 Disabled 모양).
export type MfaState =
  | 'choose-method' // 방법 고르기
  | 'fingerprint-unavailable' // 지문 사용 불가
  | 'fingerprint-waiting' // 지문 대기
  | 'fingerprint-failed' // 지문 실패
  | EmailCodeState; // 이메일 코드·이메일 코드 입력, 인증하는 중(verifying), 코드 불일치(code-mismatch), 코드 만료(code-expired)

interface MfaProps {
  state: MfaState;
  // 인증 코드를 보낸 주소. 이메일 코드 단계 안내 문구에 쓴다.
  email: string;
  // 인증 코드와 세션의 남은 초. 카운트다운은 쓰는 쪽이 값을 갱신해서 한다.
  codeRemainingSeconds: number;
  sessionRemainingSeconds: number;
  onSelectFingerprint: () => void;
  onSelectEmail: () => void;
  onRetryFingerprint: () => void;
  onSubmitCode: (code: string) => void;
  onResendCode: () => void;
  className?: string;
}

// Figma DataGSMv2 "WF/MFA"(본인 인증 본문)를 옮겼다. 새 기기 로그인 모달(oauth)과
// 삭제·수정 전 오른쪽 카드(client·admin)에서 함께 쓴다. 제목과 창 틀은 쓰는 쪽이 붙인다.
// 화면만 그린다. 인증 요청(WebAuthn·코드 확인·재전송)은 쓰는 쪽이 콜백에서 하고 결과를 state로 넘긴다.
// 블록 사이 16, 버튼은 폭을 채운다.
export const Mfa = ({
  state,
  email,
  codeRemainingSeconds,
  sessionRemainingSeconds,
  onSelectFingerprint,
  onSelectEmail,
  onRetryFingerprint,
  onSubmitCode,
  onResendCode,
  className,
}: MfaProps) => {
  const unavailableId = useId();
  const rootClassName = cn('flex flex-col gap-4', className);

  if (state === 'choose-method' || state === 'fingerprint-unavailable') {
    const unavailable = state === 'fingerprint-unavailable';

    // 지문을 쓸 수 없으면 지문 버튼을 Secondary·Disabled로 내리고 이메일 버튼을 Primary로 올린다.
    return (
      <div className={rootClassName}>
        <p className="text-body-16-regular text-foreground">본인 인증 방법을 고르세요.</p>
        <div className="flex flex-col gap-2">
          <Button
            variant={unavailable ? 'secondary' : 'primary'}
            className="w-full"
            disabled={unavailable}
            aria-describedby={unavailable ? unavailableId : undefined}
            onClick={onSelectFingerprint}
          >
            <FingerprintIcon />
            지문으로 인증
          </Button>
          {unavailable && (
            <p id={unavailableId} className="text-label-14 text-foreground-muted">
              이 기기에 등록한 지문이 없습니다
            </p>
          )}
          <Button
            variant={unavailable ? 'primary' : 'secondary'}
            className="w-full"
            onClick={onSelectEmail}
          >
            <MailIcon />
            이메일로 인증
          </Button>
        </div>
      </div>
    );
  }

  if (state === 'fingerprint-waiting' || state === 'fingerprint-failed') {
    const failed = state === 'fingerprint-failed';

    // 실패하면 이메일 버튼 옆에 다시 시도(Primary)를 두고 폭을 반씩 나눈다.
    return (
      <div className={rootClassName}>
        <FingerprintStatus status={failed ? 'failed' : 'waiting'}>
          {failed ? '지문을 확인하지 못했습니다' : '지문 센서에 손가락을 대세요'}
        </FingerprintStatus>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onSelectEmail}>
            <MailIcon />
            이메일로 인증
          </Button>
          {failed && (
            <Button className="flex-1" onClick={onRetryFingerprint}>
              다시 시도
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <EmailCodeForm
      state={state}
      email={email}
      codeRemainingSeconds={codeRemainingSeconds}
      sessionRemainingSeconds={sessionRemainingSeconds}
      onSubmitCode={onSubmitCode}
      onResendCode={onResendCode}
      onSelectFingerprint={onSelectFingerprint}
      className={rootClassName}
    />
  );
};
