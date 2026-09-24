// types
import { TRectChunk } from '../types';

// utils
import { getRectChunkCache } from '../getRectChunkCache';
import { touchRectChunk } from '../touchRectChunk';

describe('touchRectChunk', () => {
  it('should mark the chunk as used in the current frame', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const chunk = {} as TRectChunk;

    // before
    touchRectChunk(gl, chunk);

    // result
    expect(getRectChunkCache(gl).touched.has(chunk)).toBe(true);
  });
});
