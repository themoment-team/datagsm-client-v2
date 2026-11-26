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

// 내용 상자 → Viewport → ScrollArea 바깥 틀
const scrollRootOf = (el: HTMLElement) => el.parentElement?.parentElement?.parentElement;

it('머리와 바닥은 스크롤 영역 밖에 고정되고 본문만 스크롤 영역 안에 있다', () => {
  render(
    <Panel
      aria-labelledby="title"
      header={<h1 id="title">관련 문서</h1>}
      footer={<a href="https://docs.datagsm.kr">문서 사이트에서 열기</a>}
    >
      <p>본문</p>
    </Panel>,
  );

  const panel = screen.getByRole('region', { name: '관련 문서' });
  expect(panel).toHaveClass('flex', 'flex-col', 'min-h-0', 'min-w-0', 'gap-8', 'py-6');

  const body = screen.getByText('본문').parentElement!;
  const scrollRoot = scrollRootOf(screen.getByText('본문'));
  expect(body).toHaveClass('px-6');
  expect(scrollRoot?.parentElement).toBe(panel);

  // 머리, 본문 스크롤 영역, 바닥 순서로 칸 바로 아래에 놓인다.
  expect([...panel.children]).toEqual([
    screen.getByRole('heading', { name: '관련 문서' }).parentElement,
    scrollRoot,
    screen.getByRole('link', { name: '문서 사이트에서 열기' }).parentElement,
  ]);
  expect(scrollRoot).not.toContainElement(screen.getByRole('heading'));
  expect(scrollRoot).not.toContainElement(screen.getByRole('link'));
});

it('기본 본문은 내용만큼 차지해서 바닥 버튼이 본문 바로 아래에 오고, 넘치면 줄어들어 스크롤된다', () => {
  render(
    <Panel aria-label="학생 상세" footer={<button>수정</button>}>
      <p>본문</p>
    </Panel>,
  );

  const scrollRoot = scrollRootOf(screen.getByText('본문'));
  expect(scrollRoot).toHaveClass('min-h-0');
  expect(scrollRoot).not.toHaveClass('flex-1');
  expect(screen.getByText('본문').parentElement).not.toHaveClass('min-h-full');
  expect(screen.getByRole('button', { name: '수정' }).parentElement).toHaveClass('shrink-0');
});

it('fill이면 본문이 남은 높이를 채워서 바닥이 칸 끝에 고정되고, 안의 요소가 남은 높이까지 늘어날 수 있다', () => {
  render(
    <Panel
      aria-label="관련 문서"
      fill
      footer={<a href="https://docs.datagsm.kr">문서 사이트에서 열기</a>}
    >
      <p>목록</p>
    </Panel>,
  );

  expect(scrollRootOf(screen.getByText('목록'))).toHaveClass('min-h-0', 'flex-1');
  expect(screen.getByText('목록').parentElement).toHaveClass('min-h-full', 'flex', 'flex-col');
});
