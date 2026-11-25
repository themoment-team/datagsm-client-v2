import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge는 @theme에 더한 이름을 모르면 잘못 병합한다.
// 예: 모르는 text-title-32를 글자색으로 보고 text-foreground와 함께 쓰면 하나를 지운다.
// @datagsm/tailwind-config/shared-styles.css의 --text-* 이름을 바꾸면 여기도 함께 고친다(cn.test.ts가 비교한다).
export const TEXT_STYLES = [
  'title-32',
  'title-24',
  'heading-20',
  'body-16',
  'body-16-regular',
  'label-14',
  'caption-12',
  'badge-11',
  'brand-16',
  'code-12',
];

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: TEXT_STYLES,
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
