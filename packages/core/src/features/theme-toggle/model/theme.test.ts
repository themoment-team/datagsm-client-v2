import { expect, it } from 'vitest';

import { buildThemeCookie, getThemeCookieDomain } from './theme';

it.each([
  ['datagsm.kr', 'datagsm.kr'],
  ['docs.datagsm.kr', 'datagsm.kr'],
  ['oauth.stage.datagsm.kr', 'datagsm.kr'],
  ['localhost', undefined],
  ['notdatagsm.kr', undefined],
  ['datagsm.kr.evil.com', undefined],
])('%s에서 테마 쿠키 Domain은 %s', (hostname, domain) => {
  expect(getThemeCookieDomain(hostname)).toBe(domain);
});

it('배포 주소에서는 모든 서브도메인이 함께 쓰는 Secure 쿠키를 만든다', () => {
  expect(buildThemeCookie('dark', { hostname: 'docs.datagsm.kr', protocol: 'https:' })).toBe(
    'theme=dark; Path=/; Max-Age=31536000; SameSite=Lax; Domain=datagsm.kr; Secure',
  );
});

it('로컬에서는 Domain 없는 host-only 쿠키를 만든다(포트가 달라도 함께 쓴다)', () => {
  expect(buildThemeCookie('light', { hostname: 'localhost', protocol: 'http:' })).toBe(
    'theme=light; Path=/; Max-Age=31536000; SameSite=Lax',
  );
});
