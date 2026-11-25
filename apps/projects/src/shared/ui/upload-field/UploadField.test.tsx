import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { UploadField } from './UploadField';

const HINT = '정사각형 · PNG·JPG·WEBP·GIF · 5MB 이하';
const PREVIEW = 'https://example.com/icon.png';

const renderField = (props: Partial<Parameters<typeof UploadField>[0]> = {}) =>
  render(<UploadField label="아이콘" hint={HINT} onSelectFile={vi.fn()} {...props} />);

const getInput = () => screen.getByLabelText<HTMLInputElement>('아이콘', { exact: false });

describe('UploadField', () => {
  describe.each(['icon', 'image'] as const)('variant=%s', (variant) => {
    it('Empty: 올리기 버튼과 안내 문구를 보여 주고 입력에 라벨·안내가 연결된다', () => {
      renderField({ variant });
      const input = getInput();

      expect(input).toHaveAttribute('type', 'file');
      expect(input).toHaveAccessibleName('아이콘 이미지 올리기');
      expect(input).toHaveAccessibleDescription(HINT);
      expect(input).not.toHaveAttribute('aria-invalid');
      expect(screen.queryByRole('button', { name: '지우기' })).not.toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      if (variant === 'image') {
        expect(screen.getByText('이미지를 끌어 놓거나 올리기를 누르세요')).toBeInTheDocument();
      }
    });

    it('Filled: 미리보기 이미지와 바꾸기·지우기를 보여 준다', () => {
      const onRemove = vi.fn();
      const { container } = renderField({ variant, previewUrl: PREVIEW, onRemove });

      expect(getInput()).toHaveAccessibleName('아이콘 바꾸기');
      expect(container.querySelector('img')).toHaveAttribute('src', PREVIEW);

      fireEvent.click(screen.getByRole('button', { name: '지우기' }));

      expect(onRemove).toHaveBeenCalledOnce();
    });

    it('Uploading: 진행률을 보여 주고 버튼과 입력을 막는다', () => {
      renderField({ variant, previewUrl: PREVIEW, progress: 55, onRemove: vi.fn() });

      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '55');
      expect(screen.getByRole('button', { name: '올리는 중…' })).toBeDisabled();
      expect(getInput()).toBeDisabled();
      expect(screen.queryByRole('button', { name: '지우기' })).not.toBeInTheDocument();
      expect(screen.getByText(HINT)).toBeInTheDocument();
    });

    it('Error: 안내 자리에 오류 문구를 alert로 보여 주고 입력에 aria-invalid를 붙인다', () => {
      renderField({ variant, error: 'PNG, JPG, WEBP, GIF 이미지만 올릴 수 있습니다' });
      const input = getInput();

      expect(screen.getByRole('alert')).toHaveTextContent(
        'PNG, JPG, WEBP, GIF 이미지만 올릴 수 있습니다',
      );
      expect(screen.getByRole('alert')).toHaveClass('text-error');
      expect(screen.queryByText(HINT)).not.toBeInTheDocument();
      expect(input).toHaveAccessibleName('아이콘 다시 올리기');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      if (variant === 'image') {
        expect(screen.getByText('이미지를 다시 올리세요')).toBeInTheDocument();
      }
    });
  });

  it('파일을 고르면 onSelectFile로 넘기고 같은 파일을 다시 고를 수 있게 값을 비운다', () => {
    const onSelectFile = vi.fn();
    const file = new File(['x'], 'icon.png', { type: 'image/png' });
    renderField({ onSelectFile, accept: 'image/png' });
    const input = getInput();

    fireEvent.change(input, { target: { files: [file] } });

    expect(onSelectFile).toHaveBeenCalledWith(file);
    expect(input).toHaveAttribute('accept', 'image/png');
    expect(input.value).toBe('');
  });

  it('Kind=이미지의 빈 칸에 끌어 놓은 파일을 onSelectFile로 넘긴다', () => {
    const onSelectFile = vi.fn();
    const file = new File(['x'], 'cover.png', { type: 'image/png' });
    renderField({ variant: 'image', onSelectFile });

    fireEvent.drop(screen.getByText('이미지를 끌어 놓거나 올리기를 누르세요').parentElement!, {
      dataTransfer: { files: [file] },
    });

    expect(onSelectFile).toHaveBeenCalledWith(file);
  });

  it('Filled에서 onRemove가 없으면 지우기를 그리지 않는다', () => {
    renderField({ previewUrl: PREVIEW });

    expect(screen.queryByRole('button', { name: '지우기' })).not.toBeInTheDocument();
  });
});
