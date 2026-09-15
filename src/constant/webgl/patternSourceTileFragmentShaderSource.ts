export default `#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_tileCount;
uniform vec2 u_tileOriginUV;
uniform vec2 u_tileSizeUV;
uniform float u_opacity;

in vec2 v_localPosition;
out vec4 outColor;

void main() {
  vec2 tileUV = fract(v_localPosition * u_tileCount);
  vec2 sampleUV = u_tileOriginUV + tileUV * u_tileSizeUV;
  vec4 color = texture(u_texture, sampleUV);

  outColor = vec4(color.rgb, color.a * u_opacity);
}
`;
