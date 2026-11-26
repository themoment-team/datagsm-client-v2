/*
Iridescence shader adapted from React Bits by David Haz.
https://github.com/DavidHDev/react-bits

MIT + Commons Clause License Condition v1.0
Copyright (c) 2026 David Haz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, and distribute the Software as part of
an application, website, or product, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

Commons Clause Restriction
You may use this Software, including for any commercial purpose, so long as
you do not sell, sublicense, or redistribute the components themselves-whether
alone, in a bundle, or as a ported version.
The same restriction covers the React Bits tools (Background Studio, Texture
Lab, Shape Magic, Center Stage, Sound Lab and any tools added later) and the
sounds in the sound library. You may not sell, sublicense, or redistribute
the tools or the sounds themselves, or offer the tools or a substantially
similar copy of them as a hosted service-whether alone, in a bundle, or as
a ported version.
What you make with the tools is yours to use. You can use exported code,
images, videos, and audio files in any personal or commercial application,
website, or product, including paid ones. You may not sell or redistribute
the exports on their own, either individually or as the product itself, such
as a sound, texture, background, or template pack.

No Warranty
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// 디자인 팀이 전달한 deep-black-iridescence.html(Dark), black-liquid-glass.html(Light)의 셰이더다.
// 두 파일은 마지막 톤 매핑만 다르므로 한 셰이더에 두고 uniform light로 고른다. 숫자는 원본 그대로 둔다.
export const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float light;

void main() {
  vec2 aspect = resolution / min(resolution.x, resolution.y);
  vec2 uv = (gl_FragCoord.xy / resolution * 2.0 - 1.0) * aspect;
  vec2 p = uv;
  float drift = time * 0.11;
  vec2 warp = vec2(
    sin(dot(p, vec2(0.61, 0.79)) + drift)
      + 0.35 * sin(dot(p, vec2(-0.87, 0.43)) - drift * 0.71 + 1.7),
    sin(dot(p, vec2(-0.73, 0.57)) - drift * 0.83 + 2.4)
      + 0.35 * sin(dot(p, vec2(0.39, 0.91)) + drift * 0.59)
  ) / 1.35;
  float strength = 0.07 + 0.025 * sin(time * 0.17 + 1.2) * sin(time * 0.093);
  uv = p + warp * strength;
  float angle = 0.075 * sin(time * 0.13) + 0.035 * sin(time * 0.071);
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;
  float flow = time * 0.65 + 0.28 * sin(time * 0.19);
  float d = -flow * 0.5;
  float a = 0.0;
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    a += cos(fi - d - a * uv.x);
    d += sin(uv.y * fi + a);
  }
  d += flow * 0.5;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  float tone = clamp((luma - 0.54) / 0.46, 0.0, 1.0);
  float shade;
  if (light > 0.5) {
    // Light: 옅은 회색 주름과 흰 밝은 면
    float monochrome = smoothstep(0.18, 0.92, tone);
    shade = 1.0 - 0.10 * pow(1.0 - monochrome, 1.2);
  } else {
    // Dark: 깊은 검정과 낮은 흑연색 반사
    shade = 0.002 + 0.09 * pow(tone, 3.8);
  }
  gl_FragColor = vec4(vec3(shade), 1.0);
}
`;
