import { describe, expect, it } from 'vitest';

import { parseEnv } from './appEnv';
import { AppUrlsEnvSchema, readAppUrlsEnv, toAppUrls } from './appUrls';

const valid = {
  APP_CLIENT_URL: 'https://datagsm.kr/',
  APP_DOCS_URL: 'https://docs.datagsm.kr',
  APP_STATUS_URL: 'https://status.datagsm.kr',
  APP_PROJECTS_URL: 'https://projects.datagsm.kr',
};

describe('AppUrlsEnvSchema', () => {
  it('앱 주소가 하나라도 없으면 throw한다', () => {
    expect(() => parseEnv(AppUrlsEnvSchema, { ...valid, APP_DOCS_URL: undefined })).toThrow(
      'APP_DOCS_URL: 값이 없습니다',
    );
  });

  it('앱 주소가 http(s) URL이 아니면 throw한다', () => {
    expect(() => parseEnv(AppUrlsEnvSchema, { ...valid, APP_STATUS_URL: 'status' })).toThrow(
      'APP_STATUS_URL: http 또는 https URL이어야 합니다',
    );
  });
});

it('readAppUrlsEnv는 앱 주소 변수만 골라 온다', () => {
  expect(readAppUrlsEnv({ ...valid, API_BASE_URL: 'http://localhost:8080' })).toEqual(valid);
});

it('toAppUrls는 앱 ID별 주소로 바꾸고 끝의 /를 뗀다', () => {
  expect(toAppUrls(parseEnv(AppUrlsEnvSchema, valid))).toEqual({
    client: 'https://datagsm.kr',
    docs: 'https://docs.datagsm.kr',
    status: 'https://status.datagsm.kr',
    projects: 'https://projects.datagsm.kr',
  });
});
