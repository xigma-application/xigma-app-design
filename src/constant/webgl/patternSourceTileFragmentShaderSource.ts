export default `#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_periodFrac;
uniform vec2 u_tileFrac;
uniform vec2 u_alignFrac;
uniform vec2 u_tileOriginUV;
uniform vec2 u_tileSizeUV;
uniform float u_opacity;
uniform int u_hexOffsetAxis;

in vec2 v_localPosition;
out vec4 outColor;

void main() {
  vec2 shifted = v_localPosition - u_alignFrac;

  if (u_hexOffsetAxis == 1) {
    float rowIndex = floor(shifted.y / u_periodFrac.y);
    float rowParity = mod(rowIndex, 2.0);

    shifted.x -= rowParity * u_periodFrac.x * 0.5;
  } else if (u_hexOffsetAxis == 2) {
    float colIndex = floor(shifted.x / u_periodFrac.x);
    float colParity = mod(colIndex, 2.0);

    shifted.y -= colParity * u_periodFrac.y * 0.5;
  }

  vec2 cell = mod(shifted, u_periodFrac);

  if (cell.x >= u_tileFrac.x || cell.y >= u_tileFrac.y) {
    outColor = vec4(0.0, 0.0, 0.0, 0.0);
  } else {
    vec2 tileUV = cell / u_tileFrac;
    vec2 sampleUV = u_tileOriginUV + tileUV * u_tileSizeUV;
    vec4 color = texture(u_texture, sampleUV);

    outColor = vec4(color.rgb, color.a * u_opacity);
  }
}
`;
