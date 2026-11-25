import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { InfoIcon, WarningIcon } from '../icon';
import { Notice } from './Notice';

// 아이콘 컴포넌트가 그리는 path로 어떤 아이콘인지 확인한다.
const iconPath = (icon: ReactElement) =>
  render(icon).container.querySelector('path')?.getAttribute('d');

describe('Notice', () => {
  it('children 문구를 그린다', () => {
    render(<Notice>학생 정보는 매일 새벽에 갱신된다.</Notice>);

    expect(screen.getByText('학생 정보는 매일 새벽에 갱신된다.')).toBeInTheDocument();
  });

  // Figma WF/Notice의 Kind별 아이콘(WF/icon/info, WF/icon/warning)
  it.each([
    { kind: 'info', icon: <InfoIcon /> },
    { kind: 'warning', icon: <WarningIcon /> },
  ] as const)('$kind 종류는 그 아이콘을 장식으로 그린다', ({ kind, icon }) => {
    const expected = iconPath(icon);
    const { container } = render(<Notice kind={kind}>안내 문구</Notice>);
    const svg = container.querySelector('svg');

    expect(svg?.querySelector('path')).toHaveAttribute('d', expected);
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveClass('size-4');
  });

  it('kind가 없으면 info 아이콘이다', () => {
    const expected = iconPath(<InfoIcon />);
    const { container } = render(<Notice>안내 문구</Notice>);

    expect(container.querySelector('svg path')).toHaveAttribute('d', expected);
  });

  // 두 종류 모두 면 selected, 글자·아이콘 foreground(Figma wf/selected, wf/text)
  it.each(['info', 'warning'] as const)('%s 종류의 면과 글자 토큰', (kind) => {
    const { container } = render(<Notice kind={kind}>안내 문구</Notice>);

    expect(container.firstChild).toHaveClass(
      'bg-selected',
      'text-foreground',
      'text-label-14',
      'p-3',
      'gap-2',
      'rounded',
    );
  });

  it('기본으로 live region 역할을 붙이지 않는다', () => {
    const { container } = render(<Notice>안내 문구</Notice>);

    expect(container.firstChild).not.toHaveAttribute('role');
  });

  it('쓰는 곳에서 넘긴 role과 속성을 붙인다', () => {
    render(
      <Notice kind="warning" role="alert" id="notice">
        저장하지 못했다.
      </Notice>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('저장하지 못했다.');
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'notice');
  });

  it('className으로 바꾼 값이 기본값을 지운다', () => {
    const { container } = render(<Notice className="bg-surface p-4">안내 문구</Notice>);

    expect(container.firstChild).toHaveClass('bg-surface', 'p-4', 'text-foreground');
    expect(container.firstChild).not.toHaveClass('bg-selected', 'p-3');
  });
});
