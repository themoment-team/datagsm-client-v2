// 테마 선택은 모든 앱(서브도메인)이 함께 쓰는 쿠키 하나에 둔다.
// localStorage는 주소(origin)마다 따로라 client에서 바꾼 테마가 docs·status에 이어지지 않기 때문이다.
// - 배포: Domain=datagsm.kr로 저장해 모든 서브도메인에 전송된다.
// - 로컬: 쿠키는 포트를 구분하지 않으므로 host-only로 저장해도 localhost:3000~3005가 함께 쓴다.
// 인증 쿠키는 host-only로 두지만, 테마는 민감하지 않은 값이라 범위를 넓힌다. 읽을 때는 light·dark만 받는다.
export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

// 디자인 결정으로 기본은 Light이고 OS 설정은 따르지 않는다.
export const DEFAULT_THEME: Theme = 'light';
export const THEME_COOKIE = 'theme';

const SHARED_COOKIE_DOMAIN = 'datagsm.kr';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const isTheme = (value: unknown): value is Theme =>
  typeof value === 'string' && (THEMES as readonly string[]).includes(value);

// datagsm.kr과 그 서브도메인이면 공유 Domain을, 그 밖(localhost, 미리보기 주소)이면 host-only를 쓴다.
export const getThemeCookieDomain = (hostname: string) =>
  hostname === SHARED_COOKIE_DOMAIN || hostname.endsWith(`.${SHARED_COOKIE_DOMAIN}`)
    ? SHARED_COOKIE_DOMAIN
    : undefined;

export const buildThemeCookie = (
  theme: Theme,
  { hostname, protocol }: Pick<Location, 'hostname' | 'protocol'>,
) => {
  const domain = getThemeCookieDomain(hostname);
  return [
    `${THEME_COOKIE}=${theme}`,
    'Path=/',
    `Max-Age=${MAX_AGE_SECONDS}`,
    'SameSite=Lax',
    ...(domain ? [`Domain=${domain}`] : []),
    ...(protocol === 'https:' ? ['Secure'] : []),
  ].join('; ');
};

// 선택을 쿠키에 남기고 지금 화면에 바로 적용한다. shared-styles.css가 <html data-theme>로 색 토큰을 바꾼다.
export const setTheme = (theme: Theme) => {
  document.cookie = buildThemeCookie(theme, window.location);
  document.documentElement.dataset.theme = theme;
};
