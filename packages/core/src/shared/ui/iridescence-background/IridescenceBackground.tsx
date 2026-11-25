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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stop = startIridescence(canvas);
    return () => stop?.();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('pointer-events-none fixed inset-0 -z-10 size-full bg-background', className)}
    />
  );
};
