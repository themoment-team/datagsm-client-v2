import { describe, expect, it } from 'vitest';

import { formatRemainingTime } from './formatRemainingTime';

describe('formatRemainingTime', () => {
  it.each([
    [0, '00:00'],
    [5, '00:05'],
    [59, '00:59'],
    [60, '01:00'],
    [583, '09:43'],
    [3599, '59:59'],
  ])('%i초는 %s다', (seconds, expected) => {
    expect(formatRemainingTime(seconds)).toBe(expected);
  });

  it('한 시간 이상은 분을 그대로 늘린다', () => {
    expect(formatRemainingTime(3600)).toBe('60:00');
    expect(formatRemainingTime(7530)).toBe('125:30');
  });

  it('소수는 내림하고 음수·NaN은 00:00이다', () => {
    expect(formatRemainingTime(9.9)).toBe('00:09');
    expect(formatRemainingTime(-3)).toBe('00:00');
    expect(formatRemainingTime(Number.NaN)).toBe('00:00');
  });
});
