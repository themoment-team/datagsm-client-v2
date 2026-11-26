import { Button } from '@datagsm/core/shared/ui/button';
import { MailIcon } from '@datagsm/core/shared/ui/icon';

import { FingerprintStatus } from './FingerprintStatus';
import { MfaStepLayout } from './MfaStepLayout';

export type MfaFingerprintStatus = 'waiting' | 'failed';

interface MfaFingerprintStepProps {
  status: MfaFingerprintStatus;
  // 지문 실패에서 다시 시도를 누르면 부른다.
  onRetry: () => void;
  // 이메일 인증으로 넘어간다. 넘기지 않으면 이메일 버튼을 그리지 않는다.
  onSelectEmail?: () => void;
  className?: string;
}

// Figma DataGSMv2 "WF/MFA"의 지문 대기·지문 실패 단계다. 지문 확인(WebAuthn)은 쓰는 쪽이 하고 결과를 status로 넘긴다.
// 실패하면 이메일 버튼 옆에 다시 시도(Primary)를 두고 폭을 반씩 나눈다.
// 이메일 버튼이 없으면 버튼 줄은 다시 시도 하나가 폭을 채우고, 대기에서는 버튼 줄을 그리지 않는다.
export const MfaFingerprintStep = ({
  status,
  onRetry,
  onSelectEmail,
  className,
}: MfaFingerprintStepProps) => {
  const failed = status === 'failed';

  return (
    <MfaStepLayout className={className}>
      <FingerprintStatus status={status}>
        {failed ? '지문을 확인하지 못했습니다' : '지문 센서에 손가락을 대세요'}
      </FingerprintStatus>
      {(onSelectEmail || failed) && (
        <div className="flex gap-2">
          {onSelectEmail && (
            <Button variant="secondary" className="flex-1" onClick={onSelectEmail}>
              <MailIcon />
              이메일로 인증
            </Button>
          )}
          {failed && (
            <Button className="flex-1" onClick={onRetry}>
              다시 시도
            </Button>
          )}
        </div>
      )}
    </MfaStepLayout>
  );
};
