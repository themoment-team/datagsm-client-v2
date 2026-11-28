import type { ReactNode } from 'react';

// 서비스가 요청하는 권한 하나다. label은 목록에 그대로 보여 줄 문구이고, 강조 등을 위해 ReactNode로 받는다.
export interface Scope {
  id: string;
  label: ReactNode;
}
