import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DocLink } from './DocLink';

describe('DocLink', () => {
  it('문서 제목과 목적지가 있는 링크로 렌더링한다', () => {
    render(<DocLink href="/oauth">OAuth 연동</DocLink>);

    const link = screen.getByRole('link', { name: 'OAuth 연동' });

    expect(link).toHaveAttribute('href', '/oauth');
    expect(link).toHaveClass('h-12', 'border-line', 'hover:bg-row-hover');
  });
});
