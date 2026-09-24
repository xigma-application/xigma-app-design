// utils
import { getFaceBufferCache } from './getFaceBufferCache';

export const sweepFaceBuffers = (gl: WebGL2RenderingContext): void => {
  const cache = getFaceBufferCache(gl);

  cache.all.forEach((buffer, face) => {
    if (!cache.touched.has(face)) {
      gl.deleteBuffer(buffer);
      cache.all.delete(face);
    }
  });

  cache.touched.clear();
};
