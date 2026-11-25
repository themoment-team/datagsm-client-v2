import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib';
import { Logo } from './Logo';

const brandVariants = cva('flex items-center gap-4 overflow-clip py-3', {
  variants: {
    // Figma "WF/Brand"의 Padding 속성이다.
    // 16: 사이드바처럼 메뉴 아이콘과 같은 16px 들여쓰기가 있는 곳. none: 모달처럼 안쪽 여백이 없는 곳.
    padding: {
      '16': 'px-4',
      none: '',
    },
  },
  defaultVariants: {
    padding: '16',
  },
});

interface BrandProps extends VariantProps<typeof brandVariants> {
  className?: string;
}

// Figma DataGSMv2 "WF/Brand"(node 809:2133). 로고와 "DATA GSM" 글자다.
// 링크로 쓸 때는 Brand를 Link나 <a>로 감싼다. 글자가 이름이 되므로 로고는 스크린 리더에서 숨긴다.
export const Brand = ({ padding, className }: BrandProps) => (
  <div className={cn(brandVariants({ padding }), className)}>
    <Logo />
    <span className="text-brand-16 whitespace-nowrap text-foreground">DATA GSM</span>
  </div>
);
