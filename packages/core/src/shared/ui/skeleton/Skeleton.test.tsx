import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('스크린 리더에서 숨기고 wf/subtle 칠과 4px 모서리를 쓴다', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstElementChild;

    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveClass('rounded', 'bg-subtle');
  });

  it('크기는 className으로 정하고 div props를 넘긴다', () => {
    const { container } = render(<Skeleton className="h-4 w-60" data-testid="line" />);
    const skeleton = container.firstElementChild;

    expect(skeleton).toHaveClass('h-4', 'w-60', 'bg-subtle');
    expect(skeleton).toHaveAttribute('data-testid', 'line');
  });
});
