import { render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { IridescenceBackground } from './IridescenceBackground';
import { startIridescence } from './startIridescence';

// jsdom에는 WebGL이 없어서 호출만 기록하는 가짜 컨텍스트를 쓴다.
const createFakeGl = ({ compiles = true } = {}) => {
  const loseContext = vi.fn();
  const calls: { name: string; args: unknown[] }[] = [];
  const gl = new Proxy(
    {
      VERTEX_SHADER: 1,
      FRAGMENT_SHADER: 2,
      COMPILE_STATUS: 3,
      LINK_STATUS: 4,
      getShaderParameter: () => compiles,
      getProgramParameter: () => true,
      getShaderInfoLog: () => 'compile error',
      getExtension: (name: string) => (name === 'WEBGL_lose_context' ? { loseContext } : null),
      getUniformLocation: (_: unknown, name: string) => name,
    } as Record<string, unknown>,
    {
      get: (target, key: string) => {
        if (key in target) return target[key];
        return (...args: unknown[]) => {
          calls.push({ name: key, args });
          return {};
        };
      },
    },
  );
  const uniform = (name: string) => calls.filter((call) => call.args[0] === name).at(-1)?.args[1];
  return { gl, loseContext, calls, uniform };
};

const observers: { disconnect: ReturnType<typeof vi.fn> }[] = [];
const ObserverStub = vi.fn(function (this: { observe: () => void; disconnect: () => void }) {
  this.observe = vi.fn();
  this.disconnect = vi.fn();
  observers.push(this as never);
});

const stubMotion = (reduce: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches: reduce, addListener: vi.fn(), removeListener: vi.fn() }),
  );

beforeEach(() => {
  observers.length = 0;
  vi.stubGlobal('ResizeObserver', ObserverStub);
  vi.stubGlobal('IntersectionObserver', ObserverStub);
  vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  stubMotion(false);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.theme;
});

it('장식 배경이라 스크린 리더에서 숨기고, WebGL이 없으면 배경색 토큰이 대신 보인다', () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

  const { container } = render(<IridescenceBackground className="absolute" />);
  const canvas = container.querySelector('canvas');

  expect(canvas).toHaveAttribute('aria-hidden', 'true');
  expect(canvas).toHaveClass('pointer-events-none', 'bg-background', 'absolute', '-z-10');
  expect(canvas).not.toHaveClass('fixed');
});

it('언마운트하면 애니메이션·관찰을 멈추고 WebGL 컨텍스트를 돌려준다', () => {
  const fake = createFakeGl();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fake.gl as never);

  const { unmount } = render(<IridescenceBackground />);
  expect(fake.calls.some((call) => call.name === 'drawArrays')).toBe(true);
  expect(requestAnimationFrame).toHaveBeenCalled();

  unmount();

  expect(cancelAnimationFrame).toHaveBeenCalled();
  expect(observers).toHaveLength(2);
  observers.forEach((observer) => expect(observer.disconnect).toHaveBeenCalled());
  expect(fake.loseContext).toHaveBeenCalledTimes(1);
});

it('Light가 기본이고 <html data-theme="dark">이면 Dark 톤으로 그린다', () => {
  const light = createFakeGl();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(light.gl as never);
  startIridescence(document.createElement('canvas'))?.();
  expect(light.uniform('light')).toBe(1);

  document.documentElement.dataset.theme = 'dark';
  const dark = createFakeGl();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(dark.gl as never);
  startIridescence(document.createElement('canvas'))?.();
  expect(dark.uniform('light')).toBe(0);
});

it('동작 줄이기 설정이면 멈춘 장면 하나만 그리고 다음 프레임을 요청하지 않는다', () => {
  stubMotion(true);
  const fake = createFakeGl();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fake.gl as never);

  const stop = startIridescence(document.createElement('canvas'));

  expect(fake.uniform('time')).toBe(10);
  expect(requestAnimationFrame).not.toHaveBeenCalled();
  stop?.();
});

it('셰이더를 만들지 못하면 그리지 않고 컨텍스트를 돌려준다', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const fake = createFakeGl({ compiles: false });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fake.gl as never);

  expect(startIridescence(document.createElement('canvas'))).toBeNull();
  expect(fake.calls.some((call) => call.name === 'drawArrays')).toBe(false);
  expect(fake.loseContext).toHaveBeenCalledTimes(1);
});
