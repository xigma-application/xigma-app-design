export default `#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_direction;
uniform float u_radius;
uniform vec2 u_texelSize;
uniform int u_progressive;
uniform int u_unpremultiply;
uniform vec4 u_line;
uniform vec2 u_radii;
uniform vec2 u_size;

in vec2 v_texCoord;
out vec4 outColor;

void main() {
  float blurRadius = u_radius;

  if (u_progressive == 1) {
    vec2 direction = u_line.zw - u_line.xy;
    float t = clamp(dot(v_texCoord * u_size - u_line.xy, direction) / max(dot(direction, direction), 0.0001), 0.0, 1.0);

    blurRadius = mix(u_radii.x, u_radii.y, t);
  }

  float sigma = max(blurRadius / 3.0, 0.0001);
  float twoSigmaSquared = 2.0 * sigma * sigma;
  int radius = int(min(blurRadius, 32.0));
  vec4 sum = vec4(0.0);
  float weightSum = 0.0;

  for (int i = -32; i <= 32; i++) {
    if (i >= -radius && i <= radius) {
      float offset = float(i);
      float weight = exp(-(offset * offset) / twoSigmaSquared);

      sum += texture(u_texture, v_texCoord + u_direction * u_texelSize * offset) * weight;
      weightSum += weight;
    }
  }

  vec4 result = sum / max(weightSum, 0.0001);

  if (u_unpremultiply == 1 && result.a > 0.0001) {
    result.rgb /= result.a;
  }

  outColor = result;
}
`;
