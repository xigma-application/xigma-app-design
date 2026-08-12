export default `#version 300 es
in vec2 a_position;
in vec2 a_texCoord;

uniform vec2 u_viewportOffset;
uniform float u_zoom;
uniform vec2 u_resolution;

out vec2 v_texCoord;

void main() {
  vec2 screenPos = a_position * u_zoom + u_viewportOffset;
  vec2 clip = vec2(
    (screenPos.x / u_resolution.x) * 2.0 - 1.0,
    1.0 - (screenPos.y / u_resolution.y) * 2.0
  );
  gl_Position = vec4(clip, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;
