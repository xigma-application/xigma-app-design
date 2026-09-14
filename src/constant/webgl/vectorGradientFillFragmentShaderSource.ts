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
uniform float u_radiusRatio;

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
    float primaryRadius = length(axis);

    if (primaryRadius > 0.0) {
      vec2 direction = axis / primaryRadius;
      vec2 perpendicular = vec2(-direction.y, direction.x);
      vec2 relative = v_localPosition - u_start;
      float a = dot(relative, direction) / primaryRadius;
      float b = dot(relative, perpendicular) / (primaryRadius * u_radiusRatio);
      t = length(vec2(a, b));
    }
  } else if (u_gradientTypeIndex == 2) {
    vec2 primaryAxis = u_end - u_start;
    float primaryRadius = length(primaryAxis);

    if (primaryRadius > 0.0) {
      vec2 direction = primaryAxis / primaryRadius;
      vec2 perpendicular = vec2(-direction.y, direction.x);
      vec2 relative = v_localPosition - u_start;
      float a = dot(relative, direction);
      float b = dot(relative, perpendicular) / u_radiusRatio;
      float angle = atan(b, a);

      if (angle < 0.0) {
        angle += 2.0 * PI;
      }

      t = angle / (2.0 * PI);
    }
  } else {
    vec2 halfSize = max(abs(u_end - center), vec2(0.0001));
    vec2 distance = abs(v_localPosition - center);
    t = distance.x / halfSize.x + distance.y / halfSize.y;
  }

  vec4 color = sampleGradient(t);
  outColor = vec4(color.rgb, color.a * u_opacity);
}
`;
