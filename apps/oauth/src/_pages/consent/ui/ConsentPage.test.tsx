import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ConsentPage } from './ConsentPage';

const scopes = [
  { id: 'self:read', label: '내 정보 읽기' },
  { id: 'email:read', label: '이메일 읽기' },
];

const renderReady = (approving?: boolean) => {
  const onApprove = vi.fn();
  const onDeny = vi.fn();
  render(
    <ConsentPage
      status="ready"
      clientName="급식 알리미"
      scopes={scopes}
      sessionRemainingSeconds={583}
      approving={approving}
      onApprove={onApprove}
      onDeny={onDeny}
    />,
  );
  return { onApprove, onDeny };
};

describe('ready', () => {
  it('요청 문구, 권한 목록, 세션 남은 시간, 거부·승인 버튼을 그린다', () => {
    renderReady();

    expect(screen.getByRole('heading', { level: 1, name: '접근 권한 동의' })).toBeInTheDocument();
    expect(screen.getByText('급식 알리미가 아래 권한을 요청합니다.')).toBeInTheDocument();
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('세션 만료까지 09:43')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '거부' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '승인' })).toBeEnabled();
  });

  it('승인·거부를 누르면 각 콜백을 부른다', () => {
    const { onApprove, onDeny } = renderReady();

    fireEvent.click(screen.getByRole('button', { name: '승인' }));
    fireEvent.click(screen.getByRole('button', { name: '거부' }));

    expect(onApprove).toHaveBeenCalledOnce();
    expect(onDeny).toHaveBeenCalledOnce();
  });

  it('승인 처리 중에는 두 버튼을 막고 승인 라벨을 "처리 중…"으로 바꾼다', () => {
    const { onApprove, onDeny } = renderReady(true);

    const approve = screen.getByRole('button', { name: '처리 중…' });
    const deny = screen.getByRole('button', { name: '거부' });
    expect(approve).toBeDisabled();
    expect(deny).toBeDisabled();

    fireEvent.click(approve);
    fireEvent.click(deny);
    expect(onApprove).not.toHaveBeenCalled();
    expect(onDeny).not.toHaveBeenCalled();
  });

  it.each([
    ['급식 알리미', '급식 알리미가'],
    ['급식 앱', '급식 앱이'],
    ['DataGSM', 'DataGSM이(가)'],
  ])('서비스 이름 %s 뒤 조사를 받침에 맞춘다', (clientName, expected) => {
    render(
      <ConsentPage
        status="ready"
        clientName={clientName}
        scopes={scopes}
        sessionRemainingSeconds={0}
        onApprove={vi.fn()}
        onDeny={vi.fn()}
      />,
    );

    expect(screen.getByText(`${expected} 아래 권한을 요청합니다.`)).toBeInTheDocument();
  });
});

it('loading: 요청 자리를 불러오는 중으로 알리고 두 버튼을 막는다', () => {
  render(<ConsentPage status="loading" />);

  expect(screen.getByRole('heading', { level: 1, name: '접근 권한 동의' })).toBeInTheDocument();
  const busy = screen.getByText('권한 정보를 불러오는 중입니다.').parentElement;
  expect(busy).toHaveAttribute('aria-busy', 'true');
  expect(busy?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3);
  expect(screen.queryByRole('list')).toBeNull();
  expect(screen.getByRole('button', { name: '거부' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '승인' })).toBeDisabled();
});

it('unavailable: 안내와 기술문서·서버 상태 링크를 그린다', () => {
  render(
    <ConsentPage
      status="unavailable"
      docsUrl="https://docs.example.com"
      statusUrl="https://status.example.com"
    />,
  );

  expect(
    screen.getByRole('heading', { level: 1, name: '서비스 정보를 불러오지 못했습니다' }),
  ).toBeInTheDocument();
  expect(screen.getByText(/잠시 뒤 다시 시도하세요\./)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '기술문서' })).toHaveAttribute(
    'href',
    'https://docs.example.com',
  );
  expect(screen.getByRole('link', { name: '서버 상태 확인' })).toHaveAttribute(
    'href',
    'https://status.example.com',
  );
  expect(screen.queryByRole('button')).toBeNull();
});

it('invalid: 제목과 안내만 그리고 버튼이 없다', () => {
  render(<ConsentPage status="invalid" />);

  expect(screen.getByRole('heading', { level: 1, name: '잘못된 접근입니다' })).toBeInTheDocument();
  expect(screen.getByText(/잘못되었거나 만료된 접근입니다\./)).toBeInTheDocument();
  expect(screen.queryByRole('button')).toBeNull();
  expect(screen.queryByRole('link')).toBeNull();
});
