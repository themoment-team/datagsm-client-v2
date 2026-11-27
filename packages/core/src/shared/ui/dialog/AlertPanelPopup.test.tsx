import { PanelLayout } from '@datagsm/core/shared/ui/panel-layout';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { Dialog } from './Dialog';

// 오른쪽 카드 모달의 폭 식은 PanelLayout의 칸 비율과 최소 폭을 옮겨 적은 것이다(Tailwind 클래스라 상수로 나눌 수 없다).
// 오른쪽 칸이 카드 자리(560fr)인 구성에서 비율·최소 폭을 바꾸면 이 테스트가 실패해 두 곳을 함께 고치게 한다.
it.each(['triple', 'main-side', 'docs-example'] as const)(
  '창 폭 식이 PanelLayout %s의 오른쪽 칸 비율과 최소 폭을 그대로 쓴다',
  async (layout) => {
    const { container } = render(
      <PanelLayout layout={layout}>
        <div />
      </PanelLayout>,
    );
    const gridClass = container.firstElementChild!.className;
    const columns = [...gridClass.matchAll(/minmax\(0,(\d+)fr\)/g)].map(([, fr]) => Number(fr));
    const minWidth = gridClass.match(/min-w-\[(\d+)px\]/)?.[1];

    render(
      <Dialog open onClose={() => {}} title="오른쪽 카드" actions={null}>
        본문
      </Dialog>,
    );
    const dialog = await screen.findByRole('dialog', { name: '오른쪽 카드' });
    const portalClass = dialog.parentElement!.className;

    expect(portalClass).toContain(`max(${minWidth}px,`);
    expect(portalClass).toContain(`*${columns.at(-1)}/${columns.reduce((a, b) => a + b, 0)}`);
  },
);

it('창은 덮개와 같은 폭 변수로 오른쪽 끝에 붙고 본문을 스크롤 영역에 담는다', async () => {
  render(
    <Dialog open onClose={() => {}} title="오른쪽 카드" actions={null}>
      <p>본문</p>
    </Dialog>,
  );

  const dialog = await screen.findByRole('dialog', { name: '오른쪽 카드' });
  const backdrop = document.querySelector('.bg-scrim-card');

  expect(dialog).toHaveClass('right-0', 'w-(--card-width)', 'backdrop-blur-glass');
  expect(backdrop).toHaveClass('left-68', 'right-(--card-width)');
  // 내용 상자 → Viewport → 바깥 틀. 바깥 틀은 창 여백(p-6)을 넘어 창 폭 전체를 써서 막대가 여백 안에 온다.
  const content = screen.getByText('본문').parentElement;
  expect(content).toHaveClass('px-6');
  expect(content?.parentElement?.parentElement).toHaveClass('-mx-6');
});
