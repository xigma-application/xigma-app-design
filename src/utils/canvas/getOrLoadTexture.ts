const loadTextureImage = (gl: WebGL2RenderingContext, texture: WebGLTexture, src: string): void => {
  const image = new Image();

  image.onload = (): void => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  };
  image.src = src;
};

export const getOrLoadTexture = (gl: WebGL2RenderingContext, cache: Map<string, WebGLTexture>, src: string): WebGLTexture | null => {
  const cached = cache.get(src);

  if (cached) {
    return cached;
  }

  const texture = gl.createTexture();

  if (texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    cache.set(src, texture);
    loadTextureImage(gl, texture, src);
  }

  return texture;
};
