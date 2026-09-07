import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('..', import.meta.url);

test('exposes shared configuration through its segment public API', async () => {
  const configSource = await readFile(new URL('src/shared/config/index.ts', root), 'utf8');
  const sharedSource = await readFile(new URL('src/shared/index.ts', root), 'utf8');

  assert.match(configSource, /export \* from '\.\/auth';/);
  assert.match(configSource, /export \* from '\.\/env';/);
  assert.match(sharedSource, /export \* from '\.\/config';/);
});
