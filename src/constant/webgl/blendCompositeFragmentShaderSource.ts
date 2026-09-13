export default `#version 300 es
precision mediump float;

uniform sampler2D u_content;
uniform sampler2D u_backdrop;
uniform int u_blendMode;

in vec2 v_texCoord;
out vec4 outColor;

float blendLum(vec3 c) {
  return dot(c, vec3(0.3, 0.59, 0.11));
}

vec3 blendClipColor(vec3 c) {
  float l = blendLum(c);
  float n = min(min(c.r, c.g), c.b);
  float x = max(max(c.r, c.g), c.b);
  if (n < 0.0) {
    c = l + (c - l) * (l / max(l - n, 0.0001));
  }
  if (x > 1.0) {
    c = l + (c - l) * ((1.0 - l) / max(x - l, 0.0001));
  }
  return c;
}

vec3 blendSetLum(vec3 c, float l) {
  return blendClipColor(c + vec3(l - blendLum(c)));
}

float blendSat(vec3 c) {
  return max(max(c.r, c.g), c.b) - min(min(c.r, c.g), c.b);
}

vec3 blendSetSat(vec3 c, float s) {
  float cmin = min(min(c.r, c.g), c.b);
  float cmax = max(max(c.r, c.g), c.b);
  return cmax > cmin ? (c - cmin) * s / (cmax - cmin) : vec3(0.0);
}

float channelColorDodge(float cb, float cs) {
  if (cb <= 0.0) return 0.0;
  if (cs >= 1.0) return 1.0;
  return min(1.0, cb / (1.0 - cs));
}

float channelColorBurn(float cb, float cs) {
  if (cb >= 1.0) return 1.0;
  if (cs <= 0.0) return 0.0;
  return 1.0 - min(1.0, (1.0 - cb) / cs);
}

float channelHardLight(float cb, float cs) {
  return cs <= 0.5 ? (cb * 2.0 * cs) : (cb + (2.0 * cs - 1.0) - cb * (2.0 * cs - 1.0));
}

float channelSoftLightD(float x) {
  return x <= 0.25 ? ((16.0 * x - 12.0) * x + 4.0) * x : sqrt(x);
}

float channelSoftLight(float cb, float cs) {
  if (cs <= 0.5) {
    return cb - (1.0 - 2.0 * cs) * cb * (1.0 - cb);
  }
  return cb + (2.0 * cs - 1.0) * (channelSoftLightD(cb) - cb);
}

float channelOverlay(float cb, float cs) {
  return cb <= 0.5 ? (cs * 2.0 * cb) : (cs + (2.0 * cb - 1.0) - cs * (2.0 * cb - 1.0));
}

vec3 blend(int mode, vec3 cb, vec3 cs) {
  if (mode == 0) return blendSetLum(cs, blendLum(cb));
  if (mode == 1) return vec3(channelColorBurn(cb.r, cs.r), channelColorBurn(cb.g, cs.g), channelColorBurn(cb.b, cs.b));
  if (mode == 2) return vec3(channelColorDodge(cb.r, cs.r), channelColorDodge(cb.g, cs.g), channelColorDodge(cb.b, cs.b));
  if (mode == 3) return min(cb, cs);
  if (mode == 4) return abs(cb - cs);
  if (mode == 5) return cb + cs - 2.0 * cb * cs;
  if (mode == 6) return vec3(channelHardLight(cb.r, cs.r), channelHardLight(cb.g, cs.g), channelHardLight(cb.b, cs.b));
  if (mode == 7) return blendSetLum(blendSetSat(cs, blendSat(cb)), blendLum(cb));
  if (mode == 8) return max(cb, cs);
  if (mode == 9) return blendSetLum(cb, blendLum(cs));
  if (mode == 10) return cb * cs;
  if (mode == 12) return vec3(channelOverlay(cb.r, cs.r), channelOverlay(cb.g, cs.g), channelOverlay(cb.b, cs.b));
  if (mode == 13) return clamp(cb + cs - 1.0, 0.0, 1.0);
  if (mode == 14) return clamp(cb + cs, 0.0, 1.0);
  if (mode == 15) return blendSetLum(blendSetSat(cb, blendSat(cs)), blendLum(cb));
  if (mode == 16) return cb + cs - cb * cs;
  if (mode == 17) return vec3(channelSoftLight(cb.r, cs.r), channelSoftLight(cb.g, cs.g), channelSoftLight(cb.b, cs.b));
  return cs;
}

void main() {
  vec4 content = texture(u_content, v_texCoord);
  vec4 backdrop = texture(u_backdrop, v_texCoord);
  float alphaS = content.a;
  float alphaB = backdrop.a;
  vec3 blended = blend(u_blendMode, backdrop.rgb, content.rgb);
  vec3 mixedSource = mix(content.rgb, blended, alphaB);
  vec3 resultPremultiplied = (1.0 - alphaS) * (alphaB * backdrop.rgb) + alphaS * mixedSource;
  float alphaOut = alphaS + alphaB * (1.0 - alphaS);
  vec3 result = alphaOut > 0.0001 ? resultPremultiplied / alphaOut : vec3(0.0);
  outColor = vec4(result, alphaOut);
}
`;
