import { expect, it, vi } from 'vitest';

import { config } from '../../../../proxy';
import { CONSOLE_PATHS, isConsolePath } from './isConsolePath';

// proxy.ts는 불러올 때 env를 검증하고 인증 proxy를 만든다. 여기서는 matcher만 보면 되므로 둘 다 바꿔 둔다.
vi.mock('@/shared/config', () => ({ env: {} }));
vi.mock('@datagsm/core/shared/auth/server', () => ({ createAuthProxy: () => () => undefined }));

it('콘솔 메뉴 경로와 그 아래 경로는 콘솔이다', () => {
  expect(isConsolePath('/applications')).toBe(true);
  expect(isConsolePath('/clients/unknown')).toBe(true);
  expect(isConsolePath('/me/settings/x')).toBe(true);
});

it('랜딩과 콘솔 밖 경로, 이름만 이어지는 경로는 콘솔이 아니다', () => {
  expect(isConsolePath('/')).toBe(false);
  expect(isConsolePath('/asdf')).toBe(false);
  expect(isConsolePath('/clients-old')).toBe(false);
  expect(isConsolePath('/backend/v1/x')).toBe(false);
});

// 콘솔 404는 로그인한 사용자만 보도록 proxy가 로그인을 먼저 확인하는 경로와 같아야 한다.
// 메뉴나 matcher 한쪽만 바꾸면, 로그인하지 않은 사용자에게 사이드바 404가 보이거나 로그인 없이 콘솔 화면이 열린다.
it('콘솔 경로는 proxy matcher의 보호 경로(/backend 제외)와 같다', () => {
  const protectedPaths = config.matcher
    .filter((pattern) => pattern !== '/backend/:path*')
    .map((pattern) => pattern.replace('/:path*', ''));

  expect([...CONSOLE_PATHS].sort()).toEqual([...protectedPaths].sort());
});
