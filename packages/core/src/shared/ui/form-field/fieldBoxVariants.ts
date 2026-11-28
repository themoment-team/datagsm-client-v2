import { cva } from 'class-variance-authority';

// TextField·SelectField 입력칸의 선과 포커스 표시다. 두 칸이 같은 선을 쓰므로 여기 한 곳에서 고친다.
// - 기본: 1px line 선. Focus: focus-within으로 선이 strong 2px(Figma Focus).
// - 오류: 선 error 2px. 2px 선은 1px border에 1px inset ring을 더해 그린다. border 폭을 바꾸면 글자가 1px 밀리기 때문이다.
// - 오류 중에는 선을 error로 두고 포커스를 바깥 outline(strong 2px, 2px 띄움)으로 보인다(WCAG 2.4.7).
//   strong은 오류가 아닐 때의 포커스 선과 같은 색이고 error 선과 색이 달라 구별된다.
//   Figma에 Error + Focus 조합이 없어 정한 모양이라 디자이너 확인이 필요하다.
export const fieldBoxVariants = cva('rounded border', {
  variants: {
    invalid: {
      true: 'border-error inset-ring-1 inset-ring-error focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-strong',
      false:
        'border-line focus-within:border-strong focus-within:inset-ring-1 focus-within:inset-ring-strong',
    },
  },
  defaultVariants: {
    invalid: false,
  },
});
