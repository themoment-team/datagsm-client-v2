import { cva } from 'class-variance-authority';

const titleVariants = cva('', {
  variants: {
    // 본문 칸은 title-32, 가운데 카드는 title-24다.
    size: {
      pane: 'text-title-32',
      card: 'text-title-24',
    },
  },
});

interface NotFoundHeadingProps {
  size: 'pane' | 'card';
  title: string;
}

// 404 화면 공통 제목 묶음이다. 오류 코드(404) 아래 간격 8로 제목(h1)이 온다.
export const NotFoundHeading = ({ size, title }: NotFoundHeadingProps) => (
  <div className="flex flex-col gap-2">
    <p className="font-mono text-code-12 text-foreground-muted">404</p>
    <h1 className={titleVariants({ size })}>{title}</h1>
  </div>
);
