export default `#version 300 es
precision mediump float;

uniform vec2 u_viewportOffset;
uniform float u_zoom;
uniform vec4 u_color;

in vec2 v_screenPos;
out vec4 outColor;

void main() {
  vec2 worldPos = (v_screenPos - u_viewportOffset) / u_zoom;
  vec2 derivative = fwidth(worldPos);
  vec2 distanceToLine = abs(fract(worldPos - 0.5) - 0.5) / derivative;
  float lineCoverage = 1.0 - min(min(distanceToLine.x, distanceToLine.y), 1.0);

  outColor = vec4(u_color.rgb, u_color.a * lineCoverage);
}
`;
