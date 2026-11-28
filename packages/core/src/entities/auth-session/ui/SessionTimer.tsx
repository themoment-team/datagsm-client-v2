import { cn } from '@datagsm/core/shared/lib';
import { ClockIcon } from '@datagsm/core/shared/ui/icon';

import { formatRemainingTime } from '../lib/formatRemainingTime';

interface SessionTimerProps {
  remainingSeconds: number;
  className?: string;
}

// Figma DataGSMv2 OAuth 창의 "session"(왼쪽 8, 간격 8, clock 16px, label-14 wf/text-muted)을 옮겼다.
// 카운트다운은 쓰는 쪽이 remainingSeconds를 갱신해서 한다.
// 매초 바뀌는 값이라 live region을 두지 않는다(스크린 리더가 매초 읽지 않게).
export const SessionTimer = ({ remainingSeconds, className }: SessionTimerProps) => (
  <p className={cn('flex items-center gap-2 pl-2 text-label-14 text-foreground-muted', className)}>
    <ClockIcon />
    세션 만료까지 {formatRemainingTime(remainingSeconds)}
  </p>
);
