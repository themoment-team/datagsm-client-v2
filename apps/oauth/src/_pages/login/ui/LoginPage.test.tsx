import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { expect, it, vi } from 'vitest';

import { LoginPage } from './LoginPage';

const renderLoginPage = (props: Partial<ComponentProps<typeof LoginPage>> = {}) => {
  const onSubmit = vi.fn();
  render(
    <LoginPage
      clientName="급식 알리미"
      scopes={[
        { id: 'self:read', label: '내 정보 읽기' },
        { id: 'email:read', label: '이메일 읽기' },
      ]}
      sessionRemainingSeconds={583}
      signUpHref="/signup?session=abc"
      resetPasswordHref="/reset-password?session=abc"
      onSubmit={onSubmit}
      {...props}
    />,
  );
  return { onSubmit };
};

const emailInput = () => screen.getByRole('textbox', { name: '이메일 아이디' });
const passwordInput = () => screen.getByLabelText('비밀번호');
const submit = () => fireEvent.click(screen.getByRole('button', { name: '로그인' }));

it('제목, 요청 문구, 권한 목록, 세션 남은 시간을 그린다', () => {
  renderLoginPage();

  expect(screen.getByRole('heading', { level: 1, name: '로그인' })).toBeInTheDocument();
  expect(screen.getByText('급식 알리미가 아래 권한을 요청합니다.')).toBeInTheDocument();
  const items = within(screen.getByRole('list')).getAllByRole('listitem');
  expect(items.map((item) => item.textContent)).toEqual(['내 정보 읽기', '이메일 읽기']);
  expect(screen.getByText('세션 만료까지 09:43')).toBeInTheDocument();
});

it('서비스 이름이 받침 있는 한글로 끝나면 요청 문구에 "이"를 붙인다', () => {
  renderLoginPage({ clientName: '급식 앱' });

  expect(screen.getByText('급식 앱이 아래 권한을 요청합니다.')).toBeInTheDocument();
});

it('이메일 칸은 아이디만 받고 도메인을 칸 안에 보여 준다', () => {
  renderLoginPage();

  expect(emailInput()).toHaveAttribute('type', 'text');
  expect(emailInput()).toHaveAttribute('autocomplete', 'username');
  expect(emailInput()).toHaveAccessibleDescription('@gsm.hs.kr');
  expect(passwordInput()).toHaveAttribute('type', 'password');
  expect(passwordInput()).toHaveAttribute('autocomplete', 'current-password');
});

it('빈 값으로 제출하면 칸마다 오류를 보이고 onSubmit을 부르지 않는다', async () => {
  const { onSubmit } = renderLoginPage();

  submit();

  expect(await screen.findByText('이메일 아이디를 입력하세요')).toBeInTheDocument();
  expect(screen.getByText('비밀번호를 입력하세요')).toBeInTheDocument();
  expect(emailInput()).toHaveAttribute('aria-invalid', 'true');
  expect(passwordInput()).toHaveAttribute('aria-invalid', 'true');
  expect(onSubmit).not.toHaveBeenCalled();
});

it('값을 채워 제출하면 도메인을 붙인 email과 비밀번호로 onSubmit을 부른다', async () => {
  const { onSubmit } = renderLoginPage();

  fireEvent.change(emailInput(), { target: { value: 's25008' } });
  fireEvent.change(passwordInput(), { target: { value: 'secret' } });
  submit();

  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  expect(onSubmit.mock.calls[0]?.[0]).toEqual({ email: 's25008@gsm.hs.kr', password: 'secret' });
});

it('error를 넘기면 비밀번호 칸에 오류 문구를 알림으로 보인다', () => {
  renderLoginPage({ error: '이메일과 비밀번호를 확인하세요' });

  expect(screen.getByRole('alert')).toHaveTextContent('이메일과 비밀번호를 확인하세요');
  expect(passwordInput()).toHaveAttribute('aria-invalid', 'true');
  expect(passwordInput()).toHaveAccessibleDescription('이메일과 비밀번호를 확인하세요');
  expect(emailInput()).not.toHaveAttribute('aria-invalid');
});

it('회원가입·비밀번호 찾기 링크는 받은 주소로 간다', () => {
  renderLoginPage();

  expect(screen.getByRole('link', { name: '회원가입' })).toHaveAttribute(
    'href',
    '/signup?session=abc',
  );
  expect(screen.getByRole('link', { name: '비밀번호 찾기' })).toHaveAttribute(
    'href',
    '/reset-password?session=abc',
  );
});
