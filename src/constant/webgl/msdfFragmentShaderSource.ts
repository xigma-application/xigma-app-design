export default `#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform vec4 u_color;
uniform vec4 u_strokeColor;
uniform float u_strokeWidth;
uniform float u_screenPxRange;
in vec2 v_texCoord;
out vec4 outColor;

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

void main() {
  vec3 msdf = texture(u_texture, v_texCoord).rgb;
  float signedDist = median(msdf.r, msdf.g, msdf.b) - 0.5;
  float aa = max(fwidth(signedDist), 1e-4);
  float fillOpacity = clamp(signedDist / aa + 0.5, 0.0, 1.0);
  float strokeDist = signedDist + u_strokeWidth;
  float borderOpacity = clamp(strokeDist / aa + 0.5, 0.0, 1.0);

  vec3 rgb = mix(u_strokeColor.rgb, u_color.rgb, fillOpacity);
  float alpha = borderOpacity * mix(u_strokeColor.a, u_color.a, fillOpacity);

  outColor = vec4(rgb, alpha);
}
`;
