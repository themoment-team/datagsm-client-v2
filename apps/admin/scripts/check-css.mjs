import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// 빌드 성공만으로는 core 소스 탐색과 공통 CSS의 글꼴 포함을 보장할 수 없다.
// .next/static만 읽는다. .next/dev에는 개발 서버가 남긴 이전 CSS가 있어 결과가 틀어질 수 있다.
const root = fileURLToPath(new URL('../.next/static/', import.meta.url));
const collect = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = `${dir}/${entry.name}`;
      return entry.isDirectory() ? collect(path) : path.endsWith('.css') ? [path] : [];
    }),
  );
  return nested.flat();
};
const files = await collect(root);
assert.ok(files.length, '빌드 CSS가 없습니다.');
const css = (await Promise.all(files.map((file) => readFile(file, 'utf8')))).join('\n');
assert.match(css, /z-index:\s*314159/, 'core fixture 클래스가 빌드 CSS에서 빠졌습니다.');
// 공통 CSS가 import한 폰트의 url()이 앱 빌드에서 풀려 파일로 나갔는지 확인한다.
assert.match(
  css,
  /font-family:\s*"?Pretendard Variable/,
  'Pretendard @font-face가 빌드 CSS에서 빠졌습니다.',
);
assert.match(
  css,
  /font-family:\s*"?JetBrains Mono Variable/,
  'JetBrains Mono @font-face가 빌드 CSS에서 빠졌습니다.',
);
assert.match(
  css,
  /url\([^)]*\/media\/PretendardVariable\.subset\.[^)]*\.woff2\)/,
  'Pretendard 폰트 파일 경로가 빌드에서 풀리지 않았습니다.',
);
console.log('빌드 CSS 검증 통과');
