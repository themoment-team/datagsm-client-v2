import type { ReactNode, SVGProps } from 'react';

import { cn } from '../../lib';

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'>;

interface IconBaseProps extends IconProps {
  children: ReactNode;
}

// 모든 아이콘이 함께 쓰는 틀이다. 크기는 기본 16px(size-4)이고 className으로 바꾼다.
// 색은 currentColor라서 text-foreground-muted 같은 글자색 클래스를 따르고, Light·Dark 전환도 토큰으로 바뀐다.
// aria-label이 없으면 장식으로 보고 스크린 리더에서 숨긴다. 아이콘만 있는 버튼은 버튼에 이름을 붙이는 쪽을 먼저 고려한다.
export const Icon = ({ className, children, ...props }: IconBaseProps) => {
  const labelled = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.14286}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
      className={cn('size-4 shrink-0', className)}
      {...props}
    >
      {children}
    </svg>
  );
};
