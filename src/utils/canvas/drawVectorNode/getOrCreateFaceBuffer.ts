// types
import { TPoint } from 'types/canvas';

export const getOrCreateFaceBuffer = (
  gl: WebGL2RenderingContext,
  cache: WeakMap<TPoint[], WebGLBuffer> | null,
  scratchBuffer: WebGLBuffer,
  face: TPoint[],
): WebGLBuffer => {
  const cached = cache?.get(face);

  if (cached) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cached);

    return cached;
  }

  const persistentBuffer = cache ? gl.createBuffer() : null;
  const targetBuffer = persistentBuffer ?? scratchBuffer;

  gl.bindBuffer(gl.ARRAY_BUFFER, targetBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(face.flatMap((point) => [point.x, point.y])), gl.STATIC_DRAW);

  if (cache && persistentBuffer) {
    cache.set(face, persistentBuffer);
  }

  return targetBuffer;
};
