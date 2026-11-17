import { describe, expect, it } from 'vitest';

import { parseEnv } from './appEnv';
import { OauthEnvSchema, readOauthEnv } from './oauthEnv';

const valid = {
  OAUTH_AUTHORIZATION_BASE_URL: 'http://localhost:8083',
  OAUTH_CLIENT_ID: 'client-id',
  OAUTH_CLIENT_SECRET: 'client-secret',
};

describe('OauthEnvSchema', () => {
  it('세 값이 모두 있으면 통과한다', () => {
    expect(parseEnv(OauthEnvSchema, valid)).toEqual(valid);
  });

  it('client secret이 없으면 throw한다', () => {
    expect(() => parseEnv(OauthEnvSchema, { ...valid, OAUTH_CLIENT_SECRET: undefined })).toThrow(
      'OAUTH_CLIENT_SECRET: 값이 없습니다',
    );
  });

  it('client ID가 빈 문자열이면 throw한다', () => {
    expect(() => parseEnv(OauthEnvSchema, { ...valid, OAUTH_CLIENT_ID: '' })).toThrow(
      'OAUTH_CLIENT_ID: 값이 비어 있습니다',
    );
  });

  it('인가 서버 주소가 URL이 아니면 throw한다', () => {
    expect(() =>
      parseEnv(OauthEnvSchema, { ...valid, OAUTH_AUTHORIZATION_BASE_URL: 'oauth' }),
    ).toThrow('OAUTH_AUTHORIZATION_BASE_URL: http 또는 https URL이어야 합니다');
  });
});

it('readOauthEnv는 OAuth 변수만 골라 온다', () => {
  expect(readOauthEnv({ ...valid, API_BASE_URL: 'http://localhost:8080' })).toEqual(valid);
});
