import { cn } from '@datagsm/core/shared/lib';
import type { ReactNode } from 'react';

interface MfaStepLayoutProps {
  children: ReactNode;
  className?: string;
}

// MFA 단계들이 함께 쓰는 바깥 틀이다. Figma "WF/MFA"는 모든 단계에서 블록 사이가 16이다.
// form이 필요한 단계는 안에 `className="contents"`인 form을 두면 form의 자식도 이 간격을 그대로 받는다.
export const MfaStepLayout = ({ children, className }: MfaStepLayoutProps) => (
  <div className={cn('flex flex-col gap-4', className)}>{children}</div>
);
