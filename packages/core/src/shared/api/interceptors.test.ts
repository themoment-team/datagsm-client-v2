import axios, { type AxiosAdapter, AxiosError, AxiosHeaders } from 'axios';
import { afterEach, expect, it, vi } from 'vitest';

import { ApiError } from './apiError';
import { createApiMethods } from './createApiMethods';
import { applyInterceptors, setOnUnauthorized } from './interceptors';

const failWith =
  (status: number, data: unknown, headers: Record<string, string> = {}): AxiosAdapter =>
  (config) =>
    Promise.reject(
      new AxiosError(
        `Request failed with status code ${status}`,
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        { status, statusText: '', data, headers: new AxiosHeaders(headers), config },
      ),
    );

const failWithNetworkError: AxiosAdapter = (config) =>
  Promise.reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config));

const createApi = (adapter: AxiosAdapter) =>
  createApiMethods(applyInterceptors(axios.create({ adapter })));

const catchError = (request: Promise<unknown>) => request.catch((error: unknown) => error);

afterEach(() => {
  setOnUnauthorized(() => {});
});

it('인터셉터가 AxiosError를 ApiError로 바꾸고 서버 문구를 message에 담는다', async () => {
  const api = createApi(
    failWith(404, { status: '404 NOT_FOUND', code: 404, message: '프로젝트를 찾을 수 없습니다.' }),
  );
  const offlineApi = createApi(failWithNetworkError);

  const error = await catchError(api.get('/v1/public/projects/1'));
  const networkError = await catchError(offlineApi.get('/v1/public/projects/1'));

  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({
    status: 404,
    code: 'ERR_BAD_REQUEST',
    message: '프로젝트를 찾을 수 없습니다.',
  });
  expect(networkError).toBeInstanceOf(ApiError);
  expect(networkError).toMatchObject({ status: 0, code: 'ERR_NETWORK', message: 'Network Error' });
});

it('응답 본문에 message가 없으면 axios의 메시지를 쓴다', async () => {
  const api = createApi(failWith(500, '<html>Bad Gateway</html>'));

  const error = await catchError(api.get('/users/1'));

  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({
    status: 500,
    code: 'ERR_BAD_REQUEST',
    message: 'Request failed with status code 500',
  });
});

it('401 응답이면 onUnauthorized 훅이 한 번 호출되고 에러가 전파된다', async () => {
  const onUnauthorized = vi.fn();
  setOnUnauthorized(onUnauthorized);
  const api = createApi(failWith(401, { code: 401, message: '인증이 필요합니다.' }));
  const forbiddenApi = createApi(failWith(403, { code: 403, message: '권한이 없습니다.' }));

  const error = await catchError(api.get('/me'));
  await catchError(forbiddenApi.get('/admin'));

  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ status: 401, message: '인증이 필요합니다.' });
  expect(onUnauthorized).toHaveBeenCalledTimes(1);
  expect(onUnauthorized).toHaveBeenCalledWith(error);
});

it('동시에 들어온 401 두 건에도 onUnauthorized는 한 번만 호출된다', async () => {
  const onUnauthorized = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve)));
  setOnUnauthorized(onUnauthorized);
  const api = createApi(failWith(401, { code: 401, message: '인증이 필요합니다.' }));

  const errors = await Promise.all([catchError(api.get('/me')), catchError(api.get('/posts'))]);

  expect(errors).toEqual([expect.any(ApiError), expect.any(ApiError)]);
  expect(onUnauthorized).toHaveBeenCalledTimes(1);

  // 훅이 끝난 뒤에 들어온 401은 다시 처리한다.
  await catchError(api.get('/me'));

  expect(onUnauthorized).toHaveBeenCalledTimes(2);
});
