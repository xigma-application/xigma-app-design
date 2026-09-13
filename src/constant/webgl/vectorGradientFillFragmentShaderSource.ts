// others
import { MAX_GRADIENT_STOPS } from './vectorGradientFillConstants';

export default `#version 300 es
precision mediump float;

#define MAX_STOPS ${MAX_GRADIENT_STOPS}

uniform vec4 u_stopColors[MAX_STOPS];
uniform float u_stopPositions[MAX_STOPS];
uniform int u_stopCount;
uniform vec2 u_start;
uniform vec2 u_end;
uniform int u_gradientTypeIndex;
uniform float u_opacity;

in vec2 v_localPosition;
out vec4 outColor;

const float PI = 3.14159265359;

vec4 sampleGradient(float t) {
  float clampedT = clamp(t, 0.0, 1.0);
  vec4 color = clampedT <= u_stopPositions[0] ? u_stopColors[0] : u_stopColors[u_stopCount - 1];

  for (int i = 0; i < MAX_STOPS - 1; i++) {
    if (i >= u_stopCount - 1) {
      break;
    }

    float from = u_stopPositions[i];
    float to = u_stopPositions[i + 1];

    if (clampedT >= from && clampedT <= to) {
      float span = to - from;
      float localT = span > 0.0 ? (clampedT - from) / span : 0.0;
      color = mix(u_stopColors[i], u_stopColors[i + 1], localT);
    }
  }

  return color;
}

void main() {
  vec2 center = (u_start + u_end) * 0.5;
  vec2 axis = u_end - u_start;
  float t = 0.0;

  if (u_gradientTypeIndex == 0) {
    float axisLengthSq = dot(axis, axis);
    t = axisLengthSq > 0.0 ? dot(v_localPosition - u_start, axis) / axisLengthSq : 0.0;
  } else if (u_gradientTypeIndex == 1) {
    float radius = length(u_end - center);
    t = radius > 0.0 ? length(v_localPosition - center) / radius : 0.0;
  } else if (u_gradientTypeIndex == 2) {
    vec2 baseDirection = u_end - center;
    float baseAngle = atan(baseDirection.y, baseDirection.x);
    vec2 direction = v_localPosition - center;
    float angle = atan(direction.y, direction.x) - baseAngle;

    if (angle < 0.0) {
      angle += 2.0 * PI;
    }

    t = angle / (2.0 * PI);
  } else {
    vec2 halfSize = max(abs(u_end - center), vec2(0.0001));
    vec2 distance = abs(v_localPosition - center);
    t = distance.x / halfSize.x + distance.y / halfSize.y;
  }

  vec4 color = sampleGradient(t);
  outColor = vec4(color.rgb, color.a * u_opacity);
}
`;
