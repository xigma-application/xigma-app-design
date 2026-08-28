// types
import { TPoint } from 'types/canvas';

// utils
import { getOrCreateFaceBuffer } from '../getOrCreateFaceBuffer';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    STATIC_DRAW: 35044,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn((): WebGLBuffer => ({}) as WebGLBuffer),
  }) as unknown as WebGL2RenderingContext;

describe('getOrCreateFaceBuffer', () => {
  it('should create and upload a new persistent buffer on a cache miss, when a cache is given', () => {
    // mock
    const gl = createGlMock();
    const scratchBuffer = {} as WebGLBuffer;
    const cache = new WeakMap<TPoint[], WebGLBuffer>();
    const face: TPoint[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    // before
    const result = getOrCreateFaceBuffer(gl, cache, scratchBuffer, face);

    // result
    expect(gl.createBuffer).toHaveBeenCalledTimes(1);
    expect(gl.bindBuffer).toHaveBeenCalledWith(gl.ARRAY_BUFFER, result);
    expect(gl.bufferData).toHaveBeenCalledWith(gl.ARRAY_BUFFER, new Float32Array([0, 0, 10, 0, 10, 10]), gl.STATIC_DRAW);
    expect(result).not.toBe(scratchBuffer);
    expect(cache.get(face)).toBe(result);
  });

  it('should return the cached buffer without creating or re-uploading on a cache hit', () => {
    // mock
    const gl = createGlMock();
    const scratchBuffer = {} as WebGLBuffer;
    const cache = new WeakMap<TPoint[], WebGLBuffer>();
    const face: TPoint[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    // before — same face reference looked up twice, as consecutive render-loop frames would
    const firstResult = getOrCreateFaceBuffer(gl, cache, scratchBuffer, face);

    vi.mocked(gl.createBuffer).mockClear();
    vi.mocked(gl.bufferData).mockClear();

    const secondResult = getOrCreateFaceBuffer(gl, cache, scratchBuffer, face);

    // result
    expect(secondResult).toBe(firstResult);
    expect(gl.createBuffer).not.toHaveBeenCalled();
    expect(gl.bufferData).not.toHaveBeenCalled();
    expect(gl.bindBuffer).toHaveBeenCalledWith(gl.ARRAY_BUFFER, firstResult);
  });

  it('should not cache and should upload into the scratch buffer when no cache is given, for ephemeral per-frame geometry', () => {
    // mock
    const gl = createGlMock();
    const scratchBuffer = {} as WebGLBuffer;
    const face: TPoint[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    // before — called twice with a fresh face array each time, as a live drag snapshot draw does
    const firstResult = getOrCreateFaceBuffer(gl, null, scratchBuffer, face);
    const secondResult = getOrCreateFaceBuffer(gl, null, scratchBuffer, [...face]);

    // result
    expect(firstResult).toBe(scratchBuffer);
    expect(secondResult).toBe(scratchBuffer);
    expect(gl.createBuffer).not.toHaveBeenCalled();
    expect(gl.bufferData).toHaveBeenCalledTimes(2);
  });
});
