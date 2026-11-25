import { expect, it } from 'vitest';

import { withSubjectParticle } from './withSubjectParticle';

it.each([
  ['급식 알리미', '급식 알리미가'],
  ['급식 앱', '급식 앱이'],
  ['DataGSM', 'DataGSM이(가)'],
  ['앱2', '앱2이(가)'],
])('%s → %s', (name, expected) => {
  expect(withSubjectParticle(name)).toBe(expected);
});
