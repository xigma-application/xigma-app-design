export default `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec4 a_color;

uniform vec2 u_viewportOffset;
uniform float u_zoom;
uniform vec2 u_resolution;

out vec4 v_color;

void main() {
  vec2 screenPos = a_position * u_zoom + u_viewportOffset;
  vec2 clip = vec2(
    (screenPos.x / u_resolution.x) * 2.0 - 1.0,
    1.0 - (screenPos.y / u_resolution.y) * 2.0
  );
  gl_Position = vec4(clip, 0.0, 1.0);
  v_color = a_color;
}
`;
