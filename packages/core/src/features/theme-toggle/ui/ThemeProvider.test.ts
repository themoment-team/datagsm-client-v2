import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

// ThemeProvider는 data-theme만 바꾸고, 색은 공통 CSS의 [data-theme='dark'] 블록이 Light 값을 덮어써서 바뀐다.
// 한쪽에만 색 토큰을 더하면 그 색은 모드가 바뀌어도 그대로 남는다.
it('Dark 블록이 @theme의 색 토큰을 빠짐없이 덮어쓴다', () => {
  // jsdom 환경에서는 import.meta.url이 file: 주소가 아니어서 dirname으로 경로를 만든다.
  const css = readFileSync(
    resolve(import.meta.dirname, '../../../../../tailwind-config/shared-styles.css'),
    'utf8',
  );
  const block = (selector: string) => {
    const start = css.indexOf(`${selector} {`);
    expect(start, `${selector} 블록이 없습니다.`).toBeGreaterThanOrEqual(0);
    return css.slice(start, css.indexOf('\n}', start));
  };
  const colorNames = (source: string) =>
    [...source.matchAll(/--color-([a-z0-9-]+):/g)]
      .map(([, name]) => name)
      .filter((name) => name !== '*')
      .sort();

  const light = colorNames(block('@theme'));

  expect(light.length).toBeGreaterThan(0);
  expect(colorNames(block("[data-theme='dark']"))).toEqual(light);
});
