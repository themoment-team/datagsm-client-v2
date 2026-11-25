import { FRAGMENT_SHADER, VERTEX_SHADER } from './shader';

// 원본 HTML과 같은 값이다. 시간은 실제 초의 0.5배로 흐르고, 한 프레임에 0.05초 넘게 건너뛰지 않는다.
const TIME_SCALE = 0.5;
const MAX_FRAME_SECONDS = 0.05;
// 동작 줄이기 설정이면 이 시각의 장면 하나만 그린다.
const STILL_TIME = 10;
// 해상도는 기기 픽셀 비율 1.5배, 긴 변 1800px을 넘지 않게 줄여 GPU 부담을 제한한다.
const MAX_PIXEL_RATIO = 1.5;
const MAX_LONG_SIDE = 1800;

const isDarkTheme = () => document.documentElement.dataset.theme === 'dark';

const compile = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('셰이더를 만들 수 없습니다.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log ?? '셰이더 컴파일에 실패했습니다.');
  }
  return shader;
};

// canvas에 배경을 그리기 시작하고, 멈추고 자원을 정리하는 함수를 돌려준다.
// WebGL을 쓸 수 없으면 null을 돌려준다. 이때 canvas 뒤의 배경색이 대신 보인다.
export const startIridescence = (canvas: HTMLCanvasElement): (() => void) | null => {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  // 이미 잃은 컨텍스트가 돌아오면(정리한 canvas를 다시 쓴 경우) 셰이더를 만들 수 없으므로 시작하지 않는다.
  if (!gl || gl.isContextLost()) return null;

  let program: WebGLProgram | null = null;
  let vertexShader: WebGLShader | null = null;
  let fragmentShader: WebGLShader | null = null;
  try {
    vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    fragmentShader = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    program = gl.createProgram();
    if (!program) throw new Error('프로그램을 만들 수 없습니다.');
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? '프로그램 연결에 실패했습니다.');
    }
  } catch (error) {
    console.error(error);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return null;
  }

  gl.useProgram(program);
  gl.disable(gl.BLEND);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms = {
    resolution: gl.getUniformLocation(program, 'resolution'),
    time: gl.getUniformLocation(program, 'time'),
    light: gl.getUniformLocation(program, 'light'),
  };

  // 동작 줄이기 설정은 페이지를 떠나지 않고도 바뀔 수 있어 변경을 따라간다.
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let still = reducedMotion.matches;
  let clock = still ? STILL_TIME : 0;
  let last = performance.now();
  let frame = 0;
  // 화면 밖이거나 탭이 숨겨지면 다음 프레임을 요청하지 않는다.
  let visible = true;
  let lost = false;

  const resize = () => {
    const { clientWidth: width, clientHeight: height } = canvas;
    const scale = Math.min(
      devicePixelRatio || 1,
      MAX_PIXEL_RATIO,
      MAX_LONG_SIDE / Math.max(width, height, 1),
    );
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const running = () => !still && visible && !document.hidden && !lost;

  const draw = (now: number) => {
    frame = 0;
    if (lost) return;
    if (!still) clock += Math.min((now - last) / 1000, MAX_FRAME_SECONDS) * TIME_SCALE;
    last = now;
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.time, clock);
    gl.uniform1f(uniforms.light, isDarkTheme() ? 0 : 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (running()) frame = requestAnimationFrame(draw);
  };

  // 멈춘 상태에서도 크기·테마가 바뀌면 한 장면은 다시 그린다.
  const requestDraw = () => {
    if (frame || lost) return;
    last = performance.now();
    frame = requestAnimationFrame(draw);
  };

  const resizeObserver = new ResizeObserver(() => {
    resize();
    requestDraw();
  });
  resizeObserver.observe(canvas);

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
    if (visible) requestDraw();
  });
  intersectionObserver.observe(canvas);

  // 테마가 바뀌어 <html data-theme>이 달라지면 그 색으로 다시 그린다.
  const themeObserver = new MutationObserver(requestDraw);
  themeObserver.observe(document.documentElement, { attributeFilter: ['data-theme'] });

  const handleVisibility = () => {
    if (!document.hidden) requestDraw();
  };
  document.addEventListener('visibilitychange', handleVisibility);

  // 켜지면 지금 장면에서 멈추고, 꺼지면 멈춘 시각부터 다시 움직인다.
  const handleMotionChange = () => {
    still = reducedMotion.matches;
    cancelAnimationFrame(frame);
    frame = 0;
    requestDraw();
  };
  reducedMotion.addEventListener('change', handleMotionChange);

  // 컨텍스트를 잃으면(GPU 압력, 드라이버 재시작 등) 복원하지 않고 canvas를 숨겨 bg-background 단색으로 남긴다.
  // 복원하려면 program·shader·buffer를 모두 다시 만들어야 하는데, 장식 배경이라 다음 새로고침까지 단색이어도 된다.
  // 그래서 preventDefault()로 복원을 요청하지 않는다.
  const handleContextLost = () => {
    lost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    canvas.style.visibility = 'hidden';
  };
  canvas.addEventListener('webglcontextlost', handleContextLost);

  resize();
  // 첫 장면은 바로 그려 빈 canvas가 한 프레임이라도 보이지 않게 한다.
  draw(last);

  return () => {
    cancelAnimationFrame(frame);
    frame = 0;
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    themeObserver.disconnect();
    document.removeEventListener('visibilitychange', handleVisibility);
    reducedMotion.removeEventListener('change', handleMotionChange);
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    // 페이지를 오갈 때 WebGL 컨텍스트가 쌓이지 않도록 바로 돌려준다.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
};
