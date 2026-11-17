import type { OauthEnv } from '../config';
import { type OauthTokens, refreshTokens } from './oauthClient';

// 같은 refresh token으로 동시에 갱신하면 인가 서버가 재사용으로 보고 저장된 토큰까지 지운다.
// 만료 직후 브라우저가 /backend 요청을 여러 개 보내면 proxy가 동시에 실행되므로,
// 같은 refresh token의 갱신은 한 번만 보내고 결과를 잠시 함께 쓴다.
// - 이 서버 인스턴스 안에서만 합쳐진다. 다른 인스턴스와 겹치면 재사용으로 거부되고 다시 로그인하게 된다.
// - 키는 refresh token 자체라서 다른 사용자의 결과를 받을 수 없다. 끝난 결과는 잠깐만 들고 있다가 지운다.
const RESULT_TTL_MS = 30_000;

const inFlight = new Map<string, Promise<OauthTokens>>();

export const refreshOnce = (env: OauthEnv, refreshToken: string) => {
  const pending = inFlight.get(refreshToken);

  if (pending) {
    return pending;
  }

  const promise = refreshTokens(env, refreshToken);
  inFlight.set(refreshToken, promise);

  const forget = () => {
    setTimeout(() => inFlight.delete(refreshToken), RESULT_TTL_MS).unref?.();
  };

  promise.then(forget, () => inFlight.delete(refreshToken));

  return promise;
};

export const resetRefreshSingleFlight = () => {
  inFlight.clear();
};
