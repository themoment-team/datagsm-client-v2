import { StrictMode } from 'react';

import { render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { IridescenceBackground } from './IridescenceBackground';
import { startIridescence } from './startIridescence';

// jsdom에는 WebGL이 없어서 호출만 기록하는 가짜 컨텍스트를 쓴다.
// 실제 WebGL처럼 loseContext 뒤에는 isContextLost가 true가 된다.
const createFakeGl = ({ compiles = true } = {}) => {
  let lost = false;
  const loseContext = vi.fn(() => {
    lost = true;
  });
  const calls: { name: string; args: unknown[] }[] = [];
  const gl = new Proxy(
    {
      VERTEX_SHADER: 1,
      FRAGMENT_SHADER: 2,
      COMPILE_STATUS: 3,
      LINK_STATUS: 4,
      getShaderParameter: () => compiles,
      getProgramParameter: () => true,
      isContextLost: () => lost,
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
  const layer = container.firstElementChild;

  expect(layer).toHaveAttribute('aria-hidden', 'true');
  expect(layer).toHaveClass('pointer-events-none', 'bg-background', 'absolute', '-z-10');
  expect(layer).not.toHaveClass('fixed');
  expect(container.querySelector('canvas')).toBeNull();
});

// 개발 모드 StrictMode는 effect를 정리한 뒤 다시 실행한다. 같은 canvas를 다시 쓰면 잃은 컨텍스트가 돌아와
// "셰이더 컴파일에 실패했습니다"가 났다. 다시 실행할 때는 새 canvas와 새 컨텍스트로 그려야 한다.
it('StrictMode에서 effect가 다시 실행돼도 새 canvas로 다시 그린다', () => {
  const contexts = new Map<HTMLCanvasElement, ReturnType<typeof createFakeGl>>();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (
    this: HTMLCanvasElement,
  ) {
    const fake = contexts.get(this) ?? createFakeGl();
    contexts.set(this, fake);
    return fake.gl as never;
  });
  const consoleError = vi.spyOn(console, 'error');

  const { container } = render(
    <StrictMode>
      <IridescenceBackground />
    </StrictMode>,
  );

  const [first, second] = [...contexts.values()];
  expect(contexts.size).toBe(2);
  expect(first?.loseContext).toHaveBeenCalledTimes(1);
  expect(second?.calls.some((call) => call.name === 'drawArrays')).toBe(true);
  expect(second?.loseContext).not.toHaveBeenCalled();
  expect(container.querySelectorAll('canvas')).toHaveLength(1);
  expect(consoleError).not.toHaveBeenCalled();
});

it('이미 잃은 컨텍스트를 받으면 시작하지 않고 오류도 남기지 않는다', () => {
  const consoleError = vi.spyOn(console, 'error');
  const fake = createFakeGl();
  fake.loseContext();
  fake.loseContext.mockClear();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fake.gl as never);

  expect(startIridescence(document.createElement('canvas'))).toBeNull();
  expect(fake.calls.some((call) => call.name === 'createShader')).toBe(false);
  expect(consoleError).not.toHaveBeenCalled();
});

it('언마운트하면 애니메이션·관찰을 멈추고 WebGL 컨텍스트를 돌려준다', () => {
  const fake = createFakeGl();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fake.gl as never);

  const { container, unmount } = render(<IridescenceBackground />);
  expect(fake.calls.some((call) => call.name === 'drawArrays')).toBe(true);
  expect(requestAnimationFrame).toHaveBeenCalled();

  expect(container.querySelectorAll('canvas')).toHaveLength(1);

  unmount();

  expect(container.querySelector('canvas')).toBeNull();
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
