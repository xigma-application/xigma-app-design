export default `#version 300 es
precision highp float;

uniform sampler2D u_content;
uniform sampler2D u_shape;
uniform vec2 u_size;
uniform vec2 u_viewportOffset;
uniform float u_zoom;
uniform float u_pixelRatio;
uniform float u_drawingBufferHeight;
uniform vec2 u_center;
uniform float u_rotation;
uniform float u_cellSize;
uniform float u_radius;
uniform int u_clip;
uniform int u_underlay;
uniform int u_inputStraight;

in vec2 v_texCoord;
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

float fractal(vec2 point) {
  return 0.55 * valueNoise(point) + 0.3 * valueNoise(point * 2.1 + vec2(11.0, 5.0)) + 0.15 * valueNoise(point * 4.3 + vec2(3.0, 17.0));
}

vec4 premultiplied(vec4 color) {
  return u_inputStraight == 1 ? vec4(color.rgb * color.a, color.a) : color;
}

void main() {
  vec2 pixel = v_texCoord * u_size;
  vec2 screen = vec2(pixel.x, u_drawingBufferHeight - pixel.y) / u_pixelRatio;
  vec2 offset = (screen - u_viewportOffset) / u_zoom - u_center;
  float cosine = cos(-u_rotation);
  float sine = sin(-u_rotation);
  vec2 local = vec2(offset.x * cosine - offset.y * sine, offset.x * sine + offset.y * cosine);
  vec2 point = local / max(u_cellSize, 0.0001);
  vec2 shift = clamp((vec2(fractal(point), fractal(point + vec2(37.2, 91.7))) - 0.5) * 2.4, -1.0, 1.0) * u_radius;
  float backCosine = cos(u_rotation);
  float backSine = sin(u_rotation);
  vec2 world = vec2(shift.x * backCosine - shift.y * backSine, shift.x * backSine + shift.y * backCosine);
  vec2 warpedCoord = v_texCoord + vec2(world.x, -world.y) * u_zoom * u_pixelRatio / u_size;
  vec4 warped = premultiplied(texture(u_content, warpedCoord));
  vec4 result = warped;

  if (u_clip == 1) {
    vec4 shape = texture(u_shape, v_texCoord);

    result = warped * shape.a;

    if (u_underlay == 1) {
      result = result + shape * (1.0 - result.a);
    }
  }

  outColor = vec4(result.rgb / max(result.a, 0.0001), result.a);
}
`;
