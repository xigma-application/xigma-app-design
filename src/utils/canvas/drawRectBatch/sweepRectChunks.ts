// utils
import { getRectChunkCache } from './getRectChunkCache';

export const sweepRectChunks = (gl: WebGL2RenderingContext): void => {
  const cache = getRectChunkCache(gl);

  cache.all.forEach((chunk) => {
    if (!cache.touched.has(chunk)) {
      gl.deleteBuffer(chunk.buffer);
      cache.all.delete(chunk);

      if (cache.chunks.get(chunk.nodes[0]) === chunk) {
        cache.chunks.delete(chunk.nodes[0]);
      }
    }
  });

  cache.touched.clear();
};
