import { cn } from '@datagsm/core/shared/lib';
import type { ComponentProps } from 'react';

type SkeletonProps = ComponentProps<'div'>;

// Figma DataGSMv2 OAuth 창 "Consent loading"의 skeleton(칠 wf/subtle, 모서리 4px)을 옮겼다.
// Figma에 애니메이션이 없어 움직이지 않는다. 크기는 쓰는 쪽이 className으로 정한다(예: h-4 w-60).
// 내용이 없는 자리 표시라 스크린 리더에서 숨긴다. 불러오는 중이라는 안내는 감싸는 영역(aria-busy 등)이 맡는다.
export const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div aria-hidden="true" className={cn('rounded bg-subtle', className)} {...props} />
);
