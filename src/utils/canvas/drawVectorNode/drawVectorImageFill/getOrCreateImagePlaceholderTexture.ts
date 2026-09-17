// constant
import { IMAGE_PLACEHOLDER_TEXTURE_CACHE_KEY, IMAGE_PLACEHOLDER_TEXTURE_SIZE_PX } from 'constant/canvas';

// utils
import { createImagePlaceholderPixels } from './createImagePlaceholderPixels';

export const getOrCreateImagePlaceholderTexture = (gl: WebGL2RenderingContext, cache: Map<string, WebGLTexture>): WebGLTexture | null => {
  const cached = cache.get(IMAGE_PLACEHOLDER_TEXTURE_CACHE_KEY);

  if (!cached) {
    const texture = gl.createTexture();

    if (texture) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        IMAGE_PLACEHOLDER_TEXTURE_SIZE_PX,
        IMAGE_PLACEHOLDER_TEXTURE_SIZE_PX,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        createImagePlaceholderPixels(),
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      cache.set(IMAGE_PLACEHOLDER_TEXTURE_CACHE_KEY, texture);
    }

    return texture;
  }

  return cached;
};
