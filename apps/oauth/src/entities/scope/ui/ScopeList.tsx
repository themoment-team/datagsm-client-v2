import { cn } from '@datagsm/core/shared/lib';
import { CheckIcon } from '@datagsm/core/shared/ui/icon';
import type { ReactNode } from 'react';

interface Scope {
  id: string;
  label: ReactNode;
}

interface ScopeListProps {
  scopes: Scope[];
  className?: string;
}

// Figma DataGSMv2 "WF/OAuth modal"의 권한 목록(permissions, node 781:2093)이다.
// 위의 요청 문구("…가 아래 권한을 요청합니다.")는 쓰는 쪽이 목록과 12 간격으로 묶는다.
// 최대 높이 280에서 잘리고 세로로 스크롤한다. Figma의 WF/Scrollbar(목록 오른쪽 8 간격)는 아직 없어 브라우저 스크롤바를 쓴다.
// 체크 아이콘은 currentColor로 글자색을 따르는 장식이다.
export const ScopeList = ({ scopes, className }: ScopeListProps) => (
  <ul className={cn('flex max-h-70 flex-col gap-2 overflow-x-clip overflow-y-auto', className)}>
    {scopes.map(({ id, label }) => (
      <li key={id} className="flex items-center gap-2 pl-2 text-label-14 text-foreground">
        <CheckIcon />
        <span className="min-w-0 flex-1">{label}</span>
      </li>
    ))}
  </ul>
);
