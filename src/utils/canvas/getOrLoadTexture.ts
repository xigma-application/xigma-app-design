// types
import { TColorProfile } from 'types/canvas';

// utils
import { getActiveColorProfile } from './activeColorProfile';

export type TTextureSize = { height: number; width: number };

export const imagePaintTextureSizeCache = new Map<string, TTextureSize>();

type TP3ImagePixels = { data: Uint8ClampedArray; height: number; width: number };

const getP3ImagePixels = (image: HTMLImageElement): TP3ImagePixels | null => {
  const canvas = document.createElement('canvas');

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext('2d', { colorSpace: 'display-p3' });

  if (context) {
    context.drawImage(image, 0, 0);

    const { data } = context.getImageData(0, 0, canvas.width, canvas.height, { colorSpace: 'display-p3' });
    return { data, height: canvas.height, width: canvas.width };
  }

  return null;
};

const uploadImageToTexture = (gl: WebGL2RenderingContext, image: HTMLImageElement, colorProfile: TColorProfile): void => {
  const p3Pixels = colorProfile === 'displayP3' ? getP3ImagePixels(image) : null;

  if (p3Pixels) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, p3Pixels.width, p3Pixels.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, p3Pixels.data);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  }
};

const loadTextureImage = (
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  src: string,
  sizeCache: Map<string, TTextureSize> | undefined,
  colorProfile: TColorProfile,
): void => {
  const image = new Image();

  image.onload = (): void => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    uploadImageToTexture(gl, image, colorProfile);
    gl.generateMipmap(gl.TEXTURE_2D);

    if (sizeCache) {
      sizeCache.set(src, { height: image.naturalHeight, width: image.naturalWidth });
    }
  };
  image.src = src;
};

const getTextureCacheKey = (src: string, colorProfile: TColorProfile): string => (colorProfile === 'displayP3' ? `${src}::displayP3` : src);

export const getOrLoadTexture = (
  gl: WebGL2RenderingContext,
  cache: Map<string, WebGLTexture>,
  src: string,
  sizeCache?: Map<string, TTextureSize>,
): WebGLTexture | null => {
  const colorProfile = getActiveColorProfile();
  const cacheKey = getTextureCacheKey(src, colorProfile);
  const cached = cache.get(cacheKey);

  if (!cached) {
    const texture = gl.createTexture();

    if (texture) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      cache.set(cacheKey, texture);
      loadTextureImage(gl, texture, src, sizeCache, colorProfile);
    }

    return texture;
  }

  return cached;
};
