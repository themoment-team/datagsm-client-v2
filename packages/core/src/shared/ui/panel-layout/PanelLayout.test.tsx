import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { Panel, PanelLayout } from './PanelLayout';

it.each([
  ['triple', 'grid-cols-[minmax(0,544fr)_minmax(0,544fr)_minmax(0,560fr)]'],
  ['triple-collapsed', 'grid-cols-[72px_minmax(0,1fr)_minmax(0,1fr)]'],
  ['main-side', 'grid-cols-[minmax(0,1088fr)_minmax(0,560fr)]'],
  ['half', 'grid-cols-2'],
  ['single', 'grid-cols-1'],
  ['docs-toc', 'grid-cols-[minmax(0,320fr)_minmax(0,1088fr)_minmax(0,240fr)]'],
  ['docs-example', 'grid-cols-[minmax(0,320fr)_minmax(0,768fr)_minmax(0,560fr)]'],
] as const)('%s 구성은 Figma 칸 폭의 비율로 나뉜다', (layout, columns) => {
  const { container } = render(<PanelLayout layout={layout}>칸</PanelLayout>);

  expect(container.firstChild).toHaveClass(columns);
});

it('화면 높이로 고정되고, 지원하는 가장 좁은 화면(1536)의 본문 폭보다 줄지 않는다', () => {
  const { container } = render(<PanelLayout layout="half">칸</PanelLayout>);

  expect(container.firstChild).toHaveClass('h-dvh', 'min-w-[1264px]', 'grid-rows-1');
});

it('Panel은 이름 붙은 구역이고, 제목을 포함한 내용 전체가 칸 안에서 스크롤된다', () => {
  render(
    <PanelLayout layout="half">
      <Panel aria-labelledby="title">
        <h1 id="title">프로젝트 등록</h1>
        <p>본문</p>
      </Panel>
    </PanelLayout>,
  );

  const panel = screen.getByRole('region', { name: '프로젝트 등록' });
  expect(panel).toHaveClass('min-h-0', 'min-w-0');

  // 제목과 본문이 같은 내용 상자(스크롤 영역 안)에 있다.
  const content = screen.getByRole('heading', { name: '프로젝트 등록' }).parentElement;
  expect(content).toContainElement(screen.getByText('본문'));
  expect(content).toHaveClass('flex', 'flex-col', 'gap-8', 'p-6');
});
