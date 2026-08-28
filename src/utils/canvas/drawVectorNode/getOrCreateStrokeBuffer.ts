export const getOrCreateStrokeBuffer = (
  gl: WebGL2RenderingContext,
  cache: WeakMap<number[], WebGLBuffer> | null,
  scratchBuffer: WebGLBuffer,
  vertices: number[],
): WebGLBuffer => {
  const cached = cache?.get(vertices);

  if (cached) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cached);

    return cached;
  }

  const persistentBuffer = cache ? gl.createBuffer() : null;
  const targetBuffer = persistentBuffer ?? scratchBuffer;

  gl.bindBuffer(gl.ARRAY_BUFFER, targetBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  if (cache && persistentBuffer) {
    cache.set(vertices, persistentBuffer);
  }

  return targetBuffer;
};
