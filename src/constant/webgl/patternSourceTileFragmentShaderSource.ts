export default `#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_periodFrac;
uniform vec2 u_tileFrac;
uniform vec2 u_alignFrac;
uniform vec2 u_tileOriginUV;
uniform vec2 u_tileSizeUV;
uniform float u_opacity;

in vec2 v_localPosition;
out vec4 outColor;

void main() {
  vec2 cell = mod(v_localPosition - u_alignFrac, u_periodFrac);

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
