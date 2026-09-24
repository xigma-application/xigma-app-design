// utils
import { getRectChunkCache } from '../getRectChunkCache';

describe('getRectChunkCache', () => {
  it('should create an empty cache per context and return the same one afterwards', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;

    // before
    const first = getRectChunkCache(gl);

    // result
    expect(first.all.size).toBe(0);
    expect(first.chunks.size).toBe(0);
    expect(first.touched.size).toBe(0);
    expect(getRectChunkCache(gl)).toBe(first);
    expect(getRectChunkCache({} as WebGL2RenderingContext)).not.toBe(first);
  });
});
