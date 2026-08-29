// types
import { TPoint } from 'types/canvas';
import { TVertexDotBufferCacheEntry } from '../types';

// utils
import { getOrCreateVertexDotBuffer } from '../getOrCreateVertexDotBuffer';

const UNIT_RIM_POINTS: TPoint[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
];

const createGlMock = (createBufferReturnsNull = false): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    STATIC_DRAW: 35044,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn((): WebGLBuffer | null => (createBufferReturnsNull ? null : ({} as WebGLBuffer))),
    deleteBuffer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('getOrCreateVertexDotBuffer', () => {
  it('should create and upload a new persistent buffer on a cache miss', () => {
    // mock
    const gl = createGlMock();
    const scratchBuffer = {} as WebGLBuffer;
    const cache = new WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>();
    const centers: TPoint[] = [{ x: 5, y: 5 }];

    // before
    const result = getOrCreateVertexDotBuffer(gl, cache, scratchBuffer, centers, 6, UNIT_RIM_POINTS);

    // result
    expect(gl.createBuffer).toHaveBeenCalledTimes(1);
    expect(gl.bindBuffer).toHaveBeenCalledWith(gl.ARRAY_BUFFER, result);
    expect(gl.bufferData).toHaveBeenCalledTimes(1);
    expect(result).not.toBe(scratchBuffer);
    expect(cache.get(centers)).toEqual([{ buffer: result, size: 6 }]);
  });

  it('should return the cached buffer without creating or re-uploading on a cache hit', () => {
    // mock
    const gl = createGlMock();
    const scratchBuffer = {} as WebGLBuffer;
    const cache = new WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>();
    const centers: TPoint[] = [{ x: 5, y: 5 }];

    // before — same centers reference and size looked up twice, as consecutive idle render-loop frames would
    const firstResult = getOrCreateVertexDotBuffer(gl, cache, scratchBuffer, centers, 6, UNIT_RIM_POINTS);

    vi.mocked(gl.createBuffer).mockClear();
    vi.mocked(gl.bufferData).mockClear();

    const secondResult = getOrCreateVertexDotBuffer(gl, cache, scratchBuffer, centers, 6, UNIT_RIM_POINTS);

    // result
    expect(secondResult).toBe(firstResult);
    expect(gl.createBuffer).not.toHaveBeenCalled();
    expect(gl.bufferData).not.toHaveBeenCalled();
    expect(gl.deleteBuffer).not.toHaveBeenCalled();
    expect(gl.bindBuffer).toHaveBeenCalledWith(gl.ARRAY_BUFFER, firstResult);
  });

  it('should keep both buffers alive for two distinct sizes of the same centers, without deleting either', () => {
    // mock — mirrors the selected-vertex outer-ring/inner-dot batches, which share `centers` but draw
    // at two different sizes within the same frame
    const gl = createGlMock();
    const scratchBuffer = {} as WebGLBuffer;
    const cache = new WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>();
    const centers: TPoint[] = [{ x: 5, y: 5 }];

    // before
    const outer = getOrCreateVertexDotBuffer(gl, cache, scratchBuffer, centers, 8, UNIT_RIM_POINTS);
    const inner = getOrCreateVertexDotBuffer(gl, cache, scratchBuffer, centers, 4, UNIT_RIM_POINTS);

    // result
    expect(gl.deleteBuffer).not.toHaveBeenCalled();
    expect(outer).not.toBe(inner);
    expect(cache.get(centers)).toEqual([
      { buffer: outer, size: 8 },
      { buffer: inner, size: 4 },
    ]);
  });

  it('should evict and delete the oldest buffer once a 3rd distinct size is requested for the same centers', () => {
    // mock — e.g. a continuous zoom gesture changing `size` on the plain batch, whose `centers` never
    // changes reference while idling/panning/zooming with no edit in progress
    const gl = createGlMock();
    const scratchBuffer = {} as WebGLBuffer;
    const cache = new WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>();
    const centers: TPoint[] = [{ x: 5, y: 5 }];

    // before
    const first = getOrCreateVertexDotBuffer(gl, cache, scratchBuffer, centers, 6, UNIT_RIM_POINTS);
    const second = getOrCreateVertexDotBuffer(gl, cache, scratchBuffer, centers, 7, UNIT_RIM_POINTS);
    const third = getOrCreateVertexDotBuffer(gl, cache, scratchBuffer, centers, 8, UNIT_RIM_POINTS);

    // result — the first (oldest) buffer was explicitly freed, not left for the WeakMap/GC to maybe
    // eventually reclaim; only the two most recent sizes remain cached
    expect(gl.deleteBuffer).toHaveBeenCalledTimes(1);
    expect(gl.deleteBuffer).toHaveBeenCalledWith(first);
    expect(cache.get(centers)).toEqual([
      { buffer: second, size: 7 },
      { buffer: third, size: 8 },
    ]);
  });

  it('should fall back to the scratch buffer and skip caching when gl.createBuffer itself returns null (context loss)', () => {
    // mock
    const gl = createGlMock(true);
    const scratchBuffer = {} as WebGLBuffer;
    const cache = new WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>();
    const centers: TPoint[] = [{ x: 5, y: 5 }];

    // before
    const result = getOrCreateVertexDotBuffer(gl, cache, scratchBuffer, centers, 6, UNIT_RIM_POINTS);

    // result
    expect(result).toBe(scratchBuffer);
    expect(gl.bindBuffer).toHaveBeenCalledWith(gl.ARRAY_BUFFER, scratchBuffer);
    expect(gl.bufferData).toHaveBeenCalledTimes(1);
    expect(cache.get(centers)).toBeUndefined();
  });
});
