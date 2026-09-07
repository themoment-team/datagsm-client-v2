import { serverAxiosInstance } from './server';

export const del = async <T>(...args: Parameters<typeof serverAxiosInstance.delete>): Promise<T> =>
  (await serverAxiosInstance.delete<T, T>(...args)) as T;

export const get = async <T>(...args: Parameters<typeof serverAxiosInstance.get>): Promise<T> =>
  (await serverAxiosInstance.get<T, T>(...args)) as T;

export const patch = async <T>(...args: Parameters<typeof serverAxiosInstance.patch>): Promise<T> =>
  (await serverAxiosInstance.patch<T, T>(...args)) as T;

export const post = async <T>(...args: Parameters<typeof serverAxiosInstance.post>): Promise<T> =>
  (await serverAxiosInstance.post<T, T>(...args)) as T;

export const put = async <T>(...args: Parameters<typeof serverAxiosInstance.put>): Promise<T> =>
  (await serverAxiosInstance.put<T, T>(...args)) as T;
