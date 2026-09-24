// types
import { TPoint } from 'types/canvas';

// utils
import { TrackedFaceBufferCache } from '../TrackedFaceBufferCache';

describe('TrackedFaceBufferCache', () => {
  it('should store a buffer per face and mark it as used', () => {
    // mock
    const cache = new TrackedFaceBufferCache();
    const face: TPoint[] = [{ x: 0, y: 0 }];
    const buffer = {} as WebGLBuffer;

    // before
    cache.set(face, buffer);

    // result
    expect(cache.all.get(face)).toBe(buffer);
    expect(cache.touched.has(face)).toBe(true);
  });

  it('should mark a face as used when its buffer is read again', () => {
    // mock
    const cache = new TrackedFaceBufferCache();
    const face: TPoint[] = [{ x: 0, y: 0 }];
    const buffer = {} as WebGLBuffer;

    cache.set(face, buffer);
    cache.touched.clear();

    // before
    const read = cache.get(face);

    // result
    expect(read).toBe(buffer);
    expect(cache.touched.has(face)).toBe(true);
  });

  it('should return undefined without marking anything for an unknown face', () => {
    // mock
    const cache = new TrackedFaceBufferCache();

    // result
    expect(cache.get([{ x: 1, y: 1 }])).toBeUndefined();
    expect(cache.touched.size).toBe(0);
  });
});
