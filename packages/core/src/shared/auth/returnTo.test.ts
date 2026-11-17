import { expect, it } from 'vitest';

import { toSafeReturnTo } from './returnTo';

it.each([
  ['/api-keys?page=2', '/api-keys?page=2'],
  ['/', '/'],
  [null, '/'],
  ['', '/'],
  ['https://evil.example', '/'],
  ['//evil.example', '/'],
  ['/\\evil.example', '/'],
])('%s는 %s로 돌아간다', (input, expected) => {
  expect(toSafeReturnTo(input)).toBe(expected);
});
