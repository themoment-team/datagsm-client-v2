'use client';

import { useEffect, useRef } from 'react';

import { cn } from '../../lib';
import { startIridescence } from './startIridescence';

interface IridescenceBackgroundProps {
  className?: string;
}

// 디자인 팀이 전달한 Iridescence 배경(Dark: deep-black-iridescence, Light: black-liquid-glass)이다.
// 기본은 화면 전체를 덮는 고정 배경 레이어(fixed, -z-10)라 내용 뒤에 깔린다. 한 화면에 하나만 둔다.
// 모든 앱은 AppShell이, AppShell을 쓰지 않는 oauth(로그인 화면)는 루트 레이아웃이 넣는다. client 랜딩(/)만 쓰지 않는다.
// 장식이라 스크린 리더에서 숨기고 클릭·포커스를 받지 않는다.
// WebGL을 쓸 수 없으면 bg-background 단색이 대신 보인다.
export const IridescenceBackground = ({ className }: IridescenceBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // canvas는 마운트할 때마다 새로 만든다. 정리할 때 WebGL 컨텍스트를 돌려주는데(loseContext),
    // 같은 canvas에서 getContext를 다시 부르면 잃은 컨텍스트가 그대로 돌아와 그릴 수 없다.
    // 개발 모드의 StrictMode는 effect를 정리한 뒤 다시 실행하므로, canvas를 재사용하면 바로 이 상황이 된다.
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.append(canvas);

    // 장식 배경이 실패해도 화면은 보여야 하므로, 예상하지 못한 예외도 단색 배경으로 넘긴다.
    let stop: (() => void) | null = null;
    try {
      stop = startIridescence(canvas);
    } catch (error) {
      console.error(error);
    }
    if (!stop) {
      canvas.remove();
      return;
    }
    const stopDrawing = stop;
    return () => {
      stopDrawing();
      canvas.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn('pointer-events-none fixed inset-0 -z-10 bg-background', className)}
    />
  );
};
