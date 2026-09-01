export default `#version 300 es
precision mediump float;

uniform sampler2D u_content;
uniform sampler2D u_mask;

in vec2 v_texCoord;
out vec4 outColor;

void main() {
  vec4 content = texture(u_content, v_texCoord);
  float maskAlpha = texture(u_mask, v_texCoord).a;
  outColor = vec4(content.rgb, content.a * maskAlpha);
}
`;
