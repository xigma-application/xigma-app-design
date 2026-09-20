export default `#version 300 es
in vec2 a_position;

uniform vec4 u_uvTransform;

out vec2 v_texCoord;

void main() {
  vec2 uv = vec2(a_position.x * 0.5 + 0.5, a_position.y * 0.5 + 0.5);
  v_texCoord = uv * u_uvTransform.xy + u_uvTransform.zw;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;
