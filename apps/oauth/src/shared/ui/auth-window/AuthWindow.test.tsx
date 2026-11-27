import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { AuthWindow } from './AuthWindow';

it('제목을 h1로, 그 위에 Brand를, 아래에 children을 그린다', () => {
  render(
    <AuthWindow title="인증 세션이 만료되었습니다">
      <p>보안을 위해 인증 세션을 끝냈습니다.</p>
    </AuthWindow>,
  );

  const heading = screen.getByRole('heading', { level: 1, name: '인증 세션이 만료되었습니다' });
  const brand = screen.getByText('DATA GSM');
  const body = screen.getByText('보안을 위해 인증 세션을 끝냈습니다.');

  expect(heading).toHaveClass('text-title-24');
  expect(brand.compareDocumentPosition(heading)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(heading.compareDocumentPosition(body)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
});

it('description을 제목 바로 아래 흐린 본문으로, children을 그 아래에 그린다', () => {
  render(
    <AuthWindow title="서비스 정보를 불러오지 못했습니다" description="잠시 뒤 다시 시도하세요.">
      <button type="button">다시 시도</button>
    </AuthWindow>,
  );

  const heading = screen.getByRole('heading', { level: 1 });
  const description = screen.getByText('잠시 뒤 다시 시도하세요.');

  expect(description.tagName).toBe('P');
  expect(description).toHaveClass('text-body-16-regular', 'text-foreground-muted');
  expect(heading.nextElementSibling).toBe(description);
  expect(description.nextElementSibling).toBe(screen.getByRole('button', { name: '다시 시도' }));
});

it('description이 없으면 본문 문단을 그리지 않는다', () => {
  render(<AuthWindow title="로그인" />);

  expect(screen.getByRole('heading', { level: 1 }).nextElementSibling).toBeNull();
});

it('Brand는 창 안쪽 여백에 맞추려고 좌우 여백 없이 그린다', () => {
  render(<AuthWindow title="로그인" />);

  expect(screen.getByText('DATA GSM').parentElement).not.toHaveClass('px-4');
});

it('화면 전체를 main으로 덮고, 창은 scrim 위 가운데에 글래스 면으로 그린다', () => {
  render(<AuthWindow title="로그인" />);

  const main = screen.getByRole('main');
  const box = screen.getByRole('heading', { level: 1 }).parentElement;

  expect(main).toHaveClass('min-h-dvh', 'items-center', 'justify-center', 'bg-scrim');
  expect(box).toHaveClass(
    'max-w-132',
    'gap-4',
    'p-6',
    'bg-glass-fill',
    'inset-ring-glass-line',
    'backdrop-blur-glass',
  );
});

it('className을 창에 더한다', () => {
  render(<AuthWindow title="로그인" className="gap-6" />);

  const box = screen.getByRole('heading', { level: 1 }).parentElement;
  expect(box).toHaveClass('gap-6');
  expect(box).not.toHaveClass('gap-4');
});
