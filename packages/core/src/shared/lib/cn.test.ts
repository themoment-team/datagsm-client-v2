import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

import { cn, TEXT_STYLES } from './cn';

it('cn이 충돌하는 클래스를 병합한다', () => {
  expect(cn('px-2 py-1', false, { 'px-4': true }, ['text-sm', 'text-lg'])).toBe(
    'py-1 px-4 text-lg',
  );
});

it('텍스트 스타일 토큰을 글자 크기로 보고 글자색과는 병합하지 않는다', () => {
  expect(cn('text-title-32 text-foreground')).toBe('text-title-32 text-foreground');
  expect(cn('text-sm', 'text-title-32')).toBe('text-title-32');
});

// 공통 CSS의 토큰 이름과 cn의 목록이 어긋나면 위 병합이 다시 틀어진다.
it('cn의 토큰 목록이 공통 CSS의 @theme와 같다', () => {
  // jsdom 환경에서는 import.meta.url이 file: 주소가 아니어서 dirname으로 경로를 만든다.
  const css = readFileSync(
    resolve(import.meta.dirname, '../../../../tailwind-config/shared-styles.css'),
    'utf8',
  );
  const names = (prefix: string) =>
    [...css.matchAll(new RegExp(`--${prefix}-([a-z0-9-]+?):`, 'g'))]
      .map(([, name]) => name)
      .filter((name) => !name.includes('--'));

  expect(names('text')).toEqual(TEXT_STYLES);
});
