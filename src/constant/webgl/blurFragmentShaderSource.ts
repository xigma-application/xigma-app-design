export default `#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_direction;
uniform float u_radius;
uniform vec2 u_texelSize;

in vec2 v_texCoord;
out vec4 outColor;

void main() {
  float sigma = max(u_radius / 3.0, 0.0001);
  float twoSigmaSquared = 2.0 * sigma * sigma;
  int radius = int(min(u_radius, 32.0));
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

  outColor = sum / max(weightSum, 0.0001);
}
`;
