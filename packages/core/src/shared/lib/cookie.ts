export const getCookie = (key: string) => {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
  );
  const value = match?.[1];

  return value === undefined ? undefined : decodeURIComponent(value);
};

export const setCookie = (key: string, value: string) => {
  const secure = location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${key}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${secure}`;
};

export const deleteCookie = (key: string) => {
  document.cookie = `${key}=; Path=/; Max-Age=0`;
};
