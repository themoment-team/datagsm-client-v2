import { cn } from '@datagsm/core/shared/lib';
import { FingerprintIcon } from '@datagsm/core/shared/ui/icon';
import type { ComponentProps, ReactNode } from 'react';

// ref·tabIndex는 MfaFingerprintStep이 단계·상태가 바뀔 때 이 상자로 포커스를 옮길 때 쓴다.
interface FingerprintStatusProps extends Pick<ComponentProps<'div'>, 'ref' | 'tabIndex'> {
  status: 'waiting' | 'failed';
  // 상태 글. Figma도 인스턴스에서 글을 덮어쓴다(MFA와 지문 등록이 다른 문구를 쓴다).
  children: ReactNode;
  className?: string;
}

// Figma DataGSMv2 "WF/Fingerprint status"(대기·실패)를 옮겼다.
// - 상자: 1px 선, 4px 모서리, 안쪽 32, 아이콘과 글 사이 12, 가운데 정렬.
// - 대기: 선 line, 아이콘 foreground, 글 foreground-muted. 실패: 선·아이콘·글 모두 error.
// - 아이콘은 40px이지만 선 굵기는 16px 아이콘과 같은 1.14286px이다(Figma 원본 값).
//   viewBox가 16이라 40px로 키우면 선도 2.5배가 되므로 1.14286 × 16 / 40으로 줄여 넘긴다.
// - 상태 글은 화면 리더가 읽게 대기는 status, 실패는 alert로 둔다. status가 바뀌면 key로 새 요소를 넣어
//   역할이 바뀐 live region이 처음부터 다시 알려지게 한다.
export const FingerprintStatus = ({
  status,
  children,
  className,
  ref,
  tabIndex,
}: FingerprintStatusProps) => {
  const failed = status === 'failed';

  return (
    <div
      ref={ref}
      tabIndex={tabIndex}
      className={cn(
        'flex flex-col items-center gap-3 rounded border p-8',
        failed ? 'border-error text-error' : 'border-line text-foreground',
        className,
      )}
    >
      <FingerprintIcon className="size-10" strokeWidth={0.457144} />
      <p
        key={status}
        role={failed ? 'alert' : 'status'}
        className={cn('text-center text-label-14', !failed && 'text-foreground-muted')}
      >
        {children}
      </p>
    </div>
  );
};
