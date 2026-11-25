import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '../../lib';

// Figma DataGSMv2 "WF/Badge"(Style)를 옮겼다.
// - Neutral: 일반 상태. Error: 장애·만료됨 같은 오류 상태. Code: 권한 범위·이벤트 이름 같은 코드 값.
// - 높이 22: Neutral·Error는 위아래 4 + 글자 badge-11(줄 높이 14), Code는 위아래 2 + code-12(줄 높이 18).
// - 색만으로 상태를 전하지 않는다. children 문구가 뜻을 담아야 한다(예: '만료됨').
const badgeVariants = cva(
  'inline-flex items-center justify-center rounded px-2 whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'bg-subtle py-1 text-badge-11 text-foreground',
        error: 'bg-error py-1 text-badge-11 text-on-strong',
        code: 'bg-subtle py-0.5 font-mono text-code-12 text-foreground',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

interface BadgeProps extends ComponentProps<'span'>, VariantProps<typeof badgeVariants> {}

export const Badge = ({ variant, className, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
