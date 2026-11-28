import { cn } from '@datagsm/core/shared/lib';
import type { SVGProps } from 'react';

export type LogoProps = Omit<SVGProps<SVGSVGElement>, 'children'>;

// Figma DataGSMv2 "WF/Logo"(node 743:1899). 앱 파비콘(app/icon.svg)과 같은 모양이다.
// 색은 currentColor라서 부모의 글자색을 따른다. 색을 바꾸려면 부모나 className에 text-* 클래스를 준다.
// aria-label이 없으면 장식으로 보고 스크린 리더에서 숨긴다. 로고만 단독으로 쓰면 aria-label을 붙인다.
export const Logo = ({ className, ...props }: LogoProps) => {
  const labelled = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 37 26"
      fill="currentColor"
      focusable="false"
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
      className={cn('h-6.5 w-9.25 shrink-0', className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.0235 0C23.4869 6.71314e-07 26.8084 1.36978 29.2574 3.80775C31.7064 6.24572 33.0824 9.55219 33.0824 13C33.0824 16.4478 31.7064 19.7543 29.2574 22.1923C26.8084 24.6302 23.4869 26 20.0235 26H9.14118C8.17955 26 7.4 25.224 7.4 24.2667V20.8C7.4 19.8427 6.62045 19.0667 5.65882 19.0667H1.74118C0.779551 19.0667 0 18.2906 0 17.3333V8.66667C0 7.70937 0.779551 6.93333 1.74118 6.93333H5.65882C6.62045 6.93333 7.4 6.15729 7.4 5.2V1.73333C7.4 0.77604 8.17955 0 9.14118 0H20.0235ZM9.57647 7.36667C8.61485 7.36667 7.83529 8.14271 7.83529 9.1V16.9C7.83529 17.8573 8.61485 18.6333 9.57647 18.6333H20.0235C23.1488 18.6333 25.6824 16.1112 25.6824 13C25.6824 9.8888 23.1488 7.36667 20.0235 7.36667H9.57647Z"
      />
      <path d="M37 24.05C37 25.127 36.123 26 35.0412 26C33.9593 26 33.0824 25.127 33.0824 24.05C33.0824 22.973 33.9593 22.1 35.0412 22.1C36.123 22.1 37 22.973 37 24.05Z" />
    </svg>
  );
};
