import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { CopyValue } from './CopyValue';

const LONG_VALUE = 'dgsm_cs_8Kq2xW7nP4vR1tY6zA3bC5dE'.repeat(4);

// jsdom에는 navigator.clipboard가 없어서 테스트마다 넣고 지운다.
const stubClipboard = (writeText?: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
};

afterEach(() => {
  stubClipboard();
});

it('값을 한 줄로 그리고 전체 값을 title로 둔다', () => {
  render(<CopyValue value={LONG_VALUE} />);
  const text = screen.getByText(LONG_VALUE);

  expect(text).toHaveClass('truncate', 'font-mono', 'text-code-12', 'text-foreground');
  expect(text).toHaveAttribute('title', LONG_VALUE);
});

it('복사 버튼을 누르면 말줄임과 상관없이 전체 값을 복사하고 onCopy를 부른다', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const handleCopy = vi.fn();
  stubClipboard(writeText);

  render(<CopyValue value={LONG_VALUE} onCopy={handleCopy} />);
  fireEvent.click(screen.getByRole('button', { name: '복사' }));

  await waitFor(() => expect(handleCopy).toHaveBeenCalledOnce());
  expect(writeText).toHaveBeenCalledWith(LONG_VALUE);
});

it('복사가 거부되면 onCopy 대신 onCopyError에 오류를 넘긴다', async () => {
  const error = new DOMException('Write permission denied.', 'NotAllowedError');
  const handleCopy = vi.fn();
  const handleCopyError = vi.fn();
  stubClipboard(vi.fn().mockRejectedValue(error));

  render(<CopyValue value="secret" onCopy={handleCopy} onCopyError={handleCopyError} />);
  fireEvent.click(screen.getByRole('button', { name: '복사' }));

  await waitFor(() => expect(handleCopyError).toHaveBeenCalledWith(error));
  expect(handleCopy).not.toHaveBeenCalled();
});

it('clipboard API가 없는 환경(HTTPS가 아닌 주소)도 onCopyError로 알린다', async () => {
  const handleCopyError = vi.fn();

  render(<CopyValue value="secret" onCopyError={handleCopyError} />);
  fireEvent.click(screen.getByRole('button', { name: '복사' }));

  await waitFor(() => expect(handleCopyError).toHaveBeenCalledWith(expect.any(TypeError)));
});

it('copyLabel로 버튼의 접근 이름을 바꾸고 화면 글자는 "복사"로 둔다', () => {
  render(<CopyValue value="9f3a1c2e" copyLabel="API 키 복사" />);

  expect(screen.getByRole('button', { name: 'API 키 복사' })).toHaveTextContent('복사');
});

it('copyable={false}면 복사 버튼을 그리지 않는다', () => {
  render(<CopyValue value="9f3a1c2e-****-****-****-a1b2c3d4e5f6" copyable={false} />);

  expect(screen.getByText('9f3a1c2e-****-****-****-a1b2c3d4e5f6')).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
