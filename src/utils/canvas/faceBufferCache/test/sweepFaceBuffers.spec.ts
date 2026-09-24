// types
import { TPoint } from 'types/canvas';

// utils
import { getFaceBufferCache } from '../getFaceBufferCache';
import { sweepFaceBuffers } from '../sweepFaceBuffers';

describe('sweepFaceBuffers', () => {
  it('should delete the buffers that were not used since the last sweep and keep the used ones', () => {
    // mock
    const gl = { deleteBuffer: vi.fn() } as unknown as WebGL2RenderingContext;
    const cache = getFaceBufferCache(gl);
    const used: TPoint[] = [{ x: 0, y: 0 }];
    const unused: TPoint[] = [{ x: 1, y: 1 }];
    const usedBuffer = {} as WebGLBuffer;
    const unusedBuffer = {} as WebGLBuffer;

    cache.set(used, usedBuffer);
    cache.set(unused, unusedBuffer);
    sweepFaceBuffers(gl);

    // before
    cache.get(used);
    sweepFaceBuffers(gl);

    // result
    expect(gl.deleteBuffer).toHaveBeenCalledTimes(1);
    expect(gl.deleteBuffer).toHaveBeenCalledWith(unusedBuffer);
    expect(cache.all.has(used)).toBe(true);
    expect(cache.all.has(unused)).toBe(false);
  });

  it('should reset the used marks so the next frame starts clean', () => {
    // mock
    const gl = { deleteBuffer: vi.fn() } as unknown as WebGL2RenderingContext;
    const cache = getFaceBufferCache(gl);

    cache.set([{ x: 0, y: 0 }], {} as WebGLBuffer);

    // before
    sweepFaceBuffers(gl);

    // result
    expect(cache.touched.size).toBe(0);
  });
});
