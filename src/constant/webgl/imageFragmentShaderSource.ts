export default `#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform float u_opacity;
uniform float u_exposure;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_temperature;
uniform float u_tint;
uniform float u_highlights;
uniform float u_shadows;
in vec2 v_texCoord;
out vec4 outColor;

vec3 applyImageAdjustments(vec3 color) {
  color *= exp2(u_exposure / 100.0 * 2.0);

  float contrastFactor = 1.0 + u_contrast / 100.0;
  color = (color - 0.5) * contrastFactor + 0.5;

  color.r += u_temperature / 100.0 * 0.1;
  color.b -= u_temperature / 100.0 * 0.1;
  color.g -= u_tint / 100.0 * 0.1;

  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(vec3(luma), color, 1.0 + u_saturation / 100.0);

  float highlightWeight = smoothstep(0.5, 1.0, luma);
  float shadowWeight = 1.0 - smoothstep(0.0, 0.5, luma);
  color += u_highlights / 100.0 * 0.3 * highlightWeight;
  color += u_shadows / 100.0 * 0.3 * shadowWeight;

  return clamp(color, 0.0, 1.0);
}

void main() {
  vec4 texColor = texture(u_texture, v_texCoord);
  outColor = vec4(applyImageAdjustments(texColor.rgb), texColor.a * u_opacity);
}
`;
