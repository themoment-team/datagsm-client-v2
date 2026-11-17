// PKCE(RFC 7636) S256. Web Crypto만 써서 Node 런타임과 Proxy 어디서나 동작한다.
const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

export const createRandomToken = (byteLength = 32) =>
  toBase64Url(crypto.getRandomValues(new Uint8Array(byteLength)));

export const createCodeChallenge = async (verifier: string) =>
  toBase64Url(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))),
  );
