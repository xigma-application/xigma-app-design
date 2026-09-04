export default `#version 300 es
precision mediump float;

uniform vec2 u_viewportOffset;
uniform float u_zoom;
uniform vec4 u_colorA;
uniform vec4 u_colorB;
uniform float u_squareSize;
uniform vec3 u_paintColor;
uniform float u_paintMix;

in vec2 v_screenPos;
out vec4 outColor;

void main() {
  vec2 worldPos = (v_screenPos - u_viewportOffset) / u_zoom;
  vec2 cell = floor(worldPos / u_squareSize);
  float parity = mod(cell.x + cell.y, 2.0);
  vec4 checker = mix(u_colorA, u_colorB, parity);

  outColor = vec4(mix(checker.rgb, u_paintColor, u_paintMix), 1.0);
}
`;
