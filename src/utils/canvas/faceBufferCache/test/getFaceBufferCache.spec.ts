// utils
import { getFaceBufferCache } from '../getFaceBufferCache';
import { TrackedFaceBufferCache } from '../TrackedFaceBufferCache';

describe('getFaceBufferCache', () => {
  it('should create one tracked cache per context and reuse it', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;

    // before
    const first = getFaceBufferCache(gl);

    // result
    expect(first).toBeInstanceOf(TrackedFaceBufferCache);
    expect(getFaceBufferCache(gl)).toBe(first);
    expect(getFaceBufferCache({} as WebGL2RenderingContext)).not.toBe(first);
  });
});
