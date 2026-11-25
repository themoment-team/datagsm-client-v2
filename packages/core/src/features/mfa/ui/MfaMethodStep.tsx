import { useId } from 'react';

import { Button } from '../../../shared/ui/button';
import { FingerprintIcon, MailIcon } from '../../../shared/ui/icon';
import { MfaStepLayout } from './MfaStepLayout';

interface MfaMethodStepProps {
  // 이 기기에서 지문을 쓸 수 있는지. false면 Figma "지문 사용 불가" 모양이다.
  fingerprintAvailable: boolean;
  onSelectFingerprint: () => void;
  onSelectEmail: () => void;
  className?: string;
}

// Figma DataGSMv2 "WF/MFA"의 방법 고르기·지문 사용 불가 단계다. 버튼은 폭을 채운다.
// 지문을 쓸 수 없으면 지문 버튼을 Secondary·Disabled로 내리고 이유를 설명으로 연결하며,
// 이메일 버튼을 Primary로 올린다.
export const MfaMethodStep = ({
  fingerprintAvailable,
  onSelectFingerprint,
  onSelectEmail,
  className,
}: MfaMethodStepProps) => {
  const unavailableId = useId();
  const unavailable = !fingerprintAvailable;

  return (
    <MfaStepLayout className={className}>
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
    </MfaStepLayout>
  );
};
