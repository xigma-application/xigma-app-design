// others
import { MSDF_ATLAS_PNG_URL } from 'constant/webgl/msdfAtlas';

// unlike getOrLoadTexture (used for Media images), this regenerates mipmaps once the real image
// loads — without them, minifying the distance field at zoom-out produces corrupted
// median-threshold results (text visually fades toward the background color instead of staying
// solid), a defect ordinary photo textures don't show as noticeably
const loadAtlasImage = (gl: WebGL2RenderingContext, texture: WebGLTexture): void => {
  const image = new Image();

  image.onload = (): void => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  image.src = MSDF_ATLAS_PNG_URL;
};

export const getMsdfAtlasTexture = (gl: WebGL2RenderingContext, cache: Map<string, WebGLTexture>): WebGLTexture | null => {
  const cached = cache.get(MSDF_ATLAS_PNG_URL);

  if (cached) {
    return cached;
  }

  const texture = gl.createTexture();

  if (texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    cache.set(MSDF_ATLAS_PNG_URL, texture);
    loadAtlasImage(gl, texture);
  }

  return texture;
};
