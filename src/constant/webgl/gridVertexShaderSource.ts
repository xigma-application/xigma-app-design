export default `#version 300 es
in vec2 a_position;

uniform vec2 u_resolution;

out vec2 v_screenPos;

void main() {
  v_screenPos = vec2((a_position.x * 0.5 + 0.5) * u_resolution.x, (1.0 - (a_position.y * 0.5 + 0.5)) * u_resolution.y);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;
