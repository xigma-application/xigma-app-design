export default `#version 300 es
precision highp float;

uniform vec4 u_color;
uniform vec4 u_secondaryColor;
uniform int u_duo;
uniform int u_multi;
uniform sampler2D u_mask;
uniform int u_useMask;
uniform vec2 u_maskSize;
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

vec3 multiColor(vec2 point) {
  vec2 colorPoint = point * 0.45;
  vec3 channels = vec3(
    valueNoise(colorPoint + vec2(3.1, 7.7)),
    valueNoise(colorPoint + vec2(41.3, 19.9)),
    valueNoise(colorPoint + vec2(83.7, 61.1))
  );

  return smoothstep(0.2, 0.8, channels);
}

void main() {
  vec2 screen = vec2(gl_FragCoord.x, u_drawingBufferHeight - gl_FragCoord.y) / u_pixelRatio;
  vec2 offset = (screen - u_viewportOffset) / u_zoom - u_center;
  float cosine = cos(-u_rotation);
  float sine = sin(-u_rotation);
  vec2 local = vec2(offset.x * cosine - offset.y * sine, offset.x * sine + offset.y * cosine);
  vec2 point = local / max(u_cellSize, 0.0001);
  float value = 0.65 * valueNoise(point) + 0.35 * valueNoise(point * 2.3 + vec2(17.0, 31.0));
  float spreadFromMiddle = (0.5 - u_density) * 0.55;
  float edge = max(fwidth(value) * 0.75, 0.0001);
  float enabled = u_density > 0.0 ? 1.0 : 0.0;
  float primary = u_color.a * enabled * smoothstep(0.5 + spreadFromMiddle - edge, 0.5 + spreadFromMiddle + edge, value);
  float secondary = u_duo == 1
    ? u_secondaryColor.a * enabled * (1.0 - smoothstep(0.5 - spreadFromMiddle - edge, 0.5 - spreadFromMiddle + edge, value))
    : 0.0;
  float alpha = primary + secondary - primary * secondary;

  vec4 duoOrMono = vec4((u_color.rgb * primary + u_secondaryColor.rgb * secondary) / max(primary + secondary, 0.0001), alpha);

  float mask = u_useMask == 1 ? texture(u_mask, gl_FragCoord.xy / u_maskSize).a : 1.0;
  vec4 painted = u_multi == 1 ? vec4(multiColor(point), primary) : duoOrMono;

  outColor = vec4(painted.rgb, painted.a * mask);
}
`;
