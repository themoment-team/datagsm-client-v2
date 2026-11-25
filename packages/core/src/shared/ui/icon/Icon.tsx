import type { ReactNode, SVGProps } from 'react';

import { cn } from '../../lib';

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'>;

interface IconBaseProps extends IconProps {
  children: ReactNode;
}

// 아이콘은 Figma DataGSMv2 "WF/Icons"(node 681:1814)를 옮긴 것이고, 원본은 16px 선 아이콘이다.
// 아이콘을 더하거나 고칠 때는 Figma에서 path를 가져와 기존 아이콘 파일 형식 그대로 <이름>Icon.tsx를 만들고 index.ts에서 내보낸다.
// Icon은 모든 아이콘이 함께 쓰는 틀이다. 크기는 기본 16px(size-4)이고 className으로 바꾼다.
// 색은 currentColor라서 text-foreground-muted 같은 글자색 클래스를 따르고, Light·Dark 전환도 토큰으로 바뀐다.
// 선 굵기 1.14286은 Figma WF/icon 원본 값이다. 쓰는 곳에서 strokeWidth로 바꿀 수 있지만,
// MailIcon은 선을 면(fill)으로 바꾼 path라 굵기가 모양에 들어 있어 strokeWidth가 적용되지 않는다.
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
