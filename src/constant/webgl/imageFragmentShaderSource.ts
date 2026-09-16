export default `#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform float u_opacity;
in vec2 v_texCoord;
out vec4 outColor;

void main() {
  vec4 texColor = texture(u_texture, v_texCoord);
  outColor = vec4(texColor.rgb, texColor.a * u_opacity);
}
`;
