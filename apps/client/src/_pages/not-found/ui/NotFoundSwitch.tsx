'use client';

import { usePathname } from 'next/navigation';

import type { ReactNode } from 'react';

import { isConsolePath } from '../lib/isConsolePath';

interface NotFoundSwitchProps {
  // 사이드바가 있는 콘솔 404
  console: ReactNode;
  // 사이드바 없는 카드 404
  landing: ReactNode;
}

// 없는 주소를 경로로 나눈다(디자이너 확인). 콘솔 메뉴 경로 아래면 콘솔 404, 그 밖이면 카드 404다.
// 콘솔 경로는 proxy.ts가 로그인을 먼저 확인하므로, 콘솔 404는 로그인한 사용자만 본다.
// 루트 not-found는 요청 주소를 props로 받지 못해서 클라이언트 컴포넌트에서 usePathname으로 고른다. 서버 렌더에서도 주소가 있어 HTML에 바로 그려진다.
export const NotFoundSwitch = ({ console, landing }: NotFoundSwitchProps) =>
  isConsolePath(usePathname()) ? console : landing;
