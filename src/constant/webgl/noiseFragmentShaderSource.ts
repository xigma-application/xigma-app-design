export default `#version 300 es
precision highp float;

uniform vec4 u_color;
uniform vec2 u_viewportOffset;
uniform float u_zoom;
uniform float u_pixelRatio;
uniform float u_drawingBufferHeight;
uniform vec2 u_center;
uniform float u_rotation;
uniform float u_cellSize;
uniform float u_density;

out vec4 outColor;

float hash(vec2 cell) {
  vec2 p = fract(cell * vec2(123.34, 456.21));

  p += dot(p, p + 45.32);

  return fract(p.x * p.y);
}

float valueNoise(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  vec2 blend = local * local * (3.0 - 2.0 * local);
  float bottom = mix(hash(cell), hash(cell + vec2(1.0, 0.0)), blend.x);
  float top = mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), blend.x);

  return mix(bottom, top, blend.y);
}

void main() {
  vec2 screen = vec2(gl_FragCoord.x, u_drawingBufferHeight - gl_FragCoord.y) / u_pixelRatio;
  vec2 offset = (screen - u_viewportOffset) / u_zoom - u_center;
  float cosine = cos(-u_rotation);
  float sine = sin(-u_rotation);
  vec2 local = vec2(offset.x * cosine - offset.y * sine, offset.x * sine + offset.y * cosine);
  vec2 point = local / max(u_cellSize, 0.0001);
  float value = 0.65 * valueNoise(point) + 0.35 * valueNoise(point * 2.3 + vec2(17.0, 31.0));
  float threshold = 0.5 + (0.5 - u_density) * 0.55;
  float edge = max(fwidth(value) * 0.75, 0.0001);
  float lit = u_density > 0.0 ? smoothstep(threshold - edge, threshold + edge, value) : 0.0;

  outColor = vec4(u_color.rgb, u_color.a * lit);
}
`;
