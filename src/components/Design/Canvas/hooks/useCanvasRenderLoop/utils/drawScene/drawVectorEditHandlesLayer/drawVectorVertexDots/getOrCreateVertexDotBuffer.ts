// types
import { TPoint } from 'types/canvas';
import { TVertexDotBufferCacheEntry } from './types';

// utils
import { buildDotBatchVertices } from './buildDotBatchVertices';

const MAX_ENTRIES_PER_CENTERS = 2;

export const getOrCreateVertexDotBuffer = (
  gl: WebGL2RenderingContext,
  cache: WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>,
  scratchBuffer: WebGLBuffer,
  centers: TPoint[],
  size: number,
  unitRimPoints: TPoint[],
): WebGLBuffer => {
  const entries = cache.get(centers) ?? [];
  const cached = entries.find((entry) => entry.size === size);

  if (cached) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cached.buffer);

    return cached.buffer;
  }

  const vertices = buildDotBatchVertices(centers, unitRimPoints);
  const persistentBuffer = gl.createBuffer();
  const targetBuffer = persistentBuffer ?? scratchBuffer;

  gl.bindBuffer(gl.ARRAY_BUFFER, targetBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  if (persistentBuffer) {
    while (entries.length >= MAX_ENTRIES_PER_CENTERS) {
      const evicted = entries.shift();

      /* v8 ignore if -- @preserve unreachable: entries.length >= MAX_ENTRIES_PER_CENTERS (>= 1) guarantees a first element */
      if (evicted) {
        gl.deleteBuffer(evicted.buffer);
      }
    }

    entries.push({ buffer: persistentBuffer, size });
    cache.set(centers, entries);
  }

  return targetBuffer;
};
