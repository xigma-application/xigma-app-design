export default `#version 300 es
in vec2 a_position;

uniform vec2 u_viewportOffset;
uniform float u_zoom;
uniform vec2 u_resolution;
uniform vec2 u_translate;
uniform vec2 u_boundsOrigin;
uniform vec2 u_boundsSize;

out vec2 v_localPosition;

void main() {
  vec2 translated = a_position + u_translate;
  vec2 screenPos = translated * u_zoom + u_viewportOffset;
  vec2 clip = vec2(
    (screenPos.x / u_resolution.x) * 2.0 - 1.0,
    1.0 - (screenPos.y / u_resolution.y) * 2.0
  );
  vec2 safeBoundsSize = vec2(
    u_boundsSize.x != 0.0 ? u_boundsSize.x : 1.0,
    u_boundsSize.y != 0.0 ? u_boundsSize.y : 1.0
  );

  v_localPosition = (a_position - u_boundsOrigin) / safeBoundsSize;
  gl_Position = vec4(clip, 0.0, 1.0);
}
`;
