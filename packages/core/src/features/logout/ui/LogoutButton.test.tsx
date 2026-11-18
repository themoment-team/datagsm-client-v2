import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { LogoutButton } from './LogoutButton';

const IDP_LOGOUT_URL = 'https://oauth.example.com/v1/oauth/logout';

const submit = vi.fn();

beforeEach(() => {
  // jsdom은 form.submit()으로 페이지를 이동하지 않으므로 호출만 확인한다.
  vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(submit);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  submit.mockReset();
});

it('인가 서버 SSO 세션을 끝낸 뒤 이 앱의 POST /api/logout을 제출한다', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal('fetch', fetchMock);

  render(<LogoutButton idpLogoutUrl={IDP_LOGOUT_URL} />);
  const button = screen.getByRole('button', { name: '로그아웃' });
  const form = button.closest('form');

  expect(form).toHaveAttribute('method', 'post');
  expect(form).toHaveAttribute('action', '/api/logout');

  fireEvent.click(button);

  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  expect(fetchMock).toHaveBeenCalledWith(
    IDP_LOGOUT_URL,
    expect.objectContaining({ method: 'POST', credentials: 'include' }),
  );
  expect(fetchMock.mock.invocationCallOrder[0]).toBeLessThan(submit.mock.invocationCallOrder[0]);
  expect(button).toBeDisabled();
});

it('SSO 세션 종료가 실패해도 이 앱 로그아웃은 제출한다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

  render(<LogoutButton idpLogoutUrl={IDP_LOGOUT_URL} />);
  fireEvent.click(screen.getByRole('button', { name: '로그아웃' }));

  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
});
