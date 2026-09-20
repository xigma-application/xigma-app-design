export default `#version 300 es
precision highp float;

uniform sampler2D u_content;
uniform vec2 u_size;
uniform vec2 u_viewportOffset;
uniform float u_zoom;
uniform float u_pixelRatio;
uniform float u_drawingBufferHeight;
uniform vec2 u_center;
uniform vec2 u_halfSize;
uniform float u_cornerRadius;
uniform float u_rotation;
uniform float u_refraction;
uniform float u_depth;
uniform float u_dispersion;
uniform float u_lightAngle;
uniform float u_lightIntensity;
uniform float u_splay;

in vec2 v_texCoord;
out vec4 outColor;

// polynomial smooth-max (Quilez), used so the box SDF's interior corner seam is never a hard kink
float smax(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;

  return max(a, b) + h * h * k * 0.25;
}

float sdBoxSmooth(vec2 point, vec2 halfSize, float radius, float smoothing) {
  vec2 q = abs(point) - halfSize + radius;

  return length(max(q, vec2(0.0))) + min(smax(q.x, q.y, smoothing), 0.0) - radius;
}

void main() {
  vec2 pixel = v_texCoord * u_size;
  vec2 screen = vec2(pixel.x, u_drawingBufferHeight - pixel.y) / u_pixelRatio;
  vec2 offset = (screen - u_viewportOffset) / u_zoom - u_center;
  float cosine = cos(-u_rotation);
  float sine = sin(-u_rotation);
  vec2 local = vec2(offset.x * cosine - offset.y * sine, offset.x * sine + offset.y * cosine);
  float radius = min(u_cornerRadius, min(u_halfSize.x, u_halfSize.y));

  // the corner seam-smoothing stays tiny and fixed — it only exists to avoid the SDF's derivative
  // kink along a corner's diagonal bisector, it must never grow large enough to change the shape
  float cornerSmoothing = max(radius * 0.08, 1.5);
  float dist = sdBoxSmooth(local, u_halfSize, radius, cornerSmoothing);

  float eps = max(cornerSmoothing, 0.75);
  vec2 normal = normalize(vec2(
    sdBoxSmooth(local + vec2(eps, 0.0), u_halfSize, radius, cornerSmoothing) - sdBoxSmooth(local - vec2(eps, 0.0), u_halfSize, radius, cornerSmoothing),
    sdBoxSmooth(local + vec2(0.0, eps), u_halfSize, radius, cornerSmoothing) - sdBoxSmooth(local - vec2(0.0, eps), u_halfSize, radius, cornerSmoothing)
  ));

  // Depth is "how far the curved (domed) region extends inward from the border" — at 0 it's a
  // thin rim, at 1 the dome covers the shape's entire cross-section (a fully domed lens), so its
  // reach scales with the shape's own half-size rather than a fixed pixel cap
  float domeSpread = mix(4.0, min(u_halfSize.x, u_halfSize.y), u_depth);
  float profile = exp(-(dist * dist) / (2.0 * domeSpread * domeSpread));

  // the displacement's magnitude is still bounded by a fixed cap regardless of how far the dome
  // spreads, so a deep dome on a large shape warps gently across a wide area instead of smearing
  float displacementStrength = mix(4.0, 40.0, u_depth);
  float displacement = profile * u_refraction * displacementStrength * 0.6;
  vec2 warpLocal = normal * displacement;
  float backCosine = cos(u_rotation);
  float backSine = sin(u_rotation);
  vec2 warpWorld = vec2(warpLocal.x * backCosine - warpLocal.y * backSine, warpLocal.x * backSine + warpLocal.y * backCosine);
  vec2 warpUv = vec2(warpWorld.x, -warpWorld.y) * u_zoom * u_pixelRatio / u_size;

  float dispersionScale = u_dispersion * 0.6;
  vec4 colorR = texture(u_content, v_texCoord + warpUv * (1.0 + dispersionScale));
  vec4 colorG = texture(u_content, v_texCoord + warpUv);
  vec4 colorB = texture(u_content, v_texCoord + warpUv * (1.0 - dispersionScale));
  vec3 refracted = vec3(colorR.r, colorG.g, colorB.b);

  // a groove that runs uniformly around the whole perimeter — a highlight ring just inside
  // the border, then a shadow line right at it — like a picture-frame bevel. Its width stays a
  // small, fixed size regardless of Depth: every Figma reference shows this crisp bevel at the
  // same thickness whether the dome is shallow or covers the whole shape
  float grooveWidth = 5.0;
  float highlight = exp(-pow(dist + grooveWidth * 0.7, 2.0) / (2.0 * pow(grooveWidth * 0.9, 2.0)));
  float shadowLine = exp(-pow(dist - grooveWidth * 0.1, 2.0) / (2.0 * pow(grooveWidth * 0.6, 2.0)));

  vec2 lightDirection = vec2(sin(u_lightAngle), -cos(u_lightAngle));
  float facing = dot(normal, lightDirection);
  float spread = mix(0.35, 0.9, u_splay);
  float lightFactor = mix(1.0 - spread, 1.0, facing * 0.5 + 0.5);

  vec3 lit = mix(refracted, vec3(1.0), highlight * u_lightIntensity * lightFactor);

  lit = mix(lit, vec3(0.0), shadowLine * mix(0.55, 0.3, lightFactor));

  outColor = vec4(lit, colorG.a);
}
`;
