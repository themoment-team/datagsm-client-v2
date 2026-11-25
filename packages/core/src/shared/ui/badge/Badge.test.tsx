import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from './Badge';

describe('Badge', () => {
  it('children 문구를 span으로 그린다', () => {
    render(<Badge>만료됨</Badge>);

    expect(screen.getByText('만료됨').tagName).toBe('SPAN');
  });

  // Figma WF/Badge의 Style별 칠·글자색·글자 스타일
  it.each([
    { variant: 'neutral', classes: ['bg-subtle', 'text-foreground', 'text-badge-11', 'py-1'] },
    { variant: 'error', classes: ['bg-error', 'text-on-strong', 'text-badge-11', 'py-1'] },
    {
      variant: 'code',
      classes: ['bg-subtle', 'text-foreground', 'font-mono', 'text-code-12', 'py-0.5'],
    },
  ] as const)('$variant 변형의 토큰을 쓴다', ({ variant, classes }) => {
    render(<Badge variant={variant}>배지</Badge>);

    expect(screen.getByText('배지')).toHaveClass(...classes);
  });

  it('variant가 없으면 neutral이다', () => {
    render(<Badge>상태</Badge>);

    expect(screen.getByText('상태')).toHaveClass('bg-subtle', 'text-badge-11', 'text-foreground');
  });

  it('className을 병합하고 겹치는 기본 클래스는 지운다', () => {
    render(
      <Badge className="ml-2 bg-selected" title="설명">
        상태
      </Badge>,
    );
    const badge = screen.getByText('상태');

    expect(badge).toHaveClass('bg-selected', 'ml-2', 'text-badge-11', 'text-foreground');
    expect(badge).not.toHaveClass('bg-subtle');
    expect(badge).toHaveAttribute('title', '설명');
  });
});
