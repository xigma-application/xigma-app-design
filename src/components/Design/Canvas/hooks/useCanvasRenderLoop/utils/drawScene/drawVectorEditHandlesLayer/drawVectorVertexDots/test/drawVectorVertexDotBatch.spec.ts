// types
import { TPoint } from 'types/canvas';
import { TVertexDotBufferCacheEntry } from '../types';

// utils
import { drawVectorVertexDotBatch } from '../drawVectorVertexDotBatch';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn((): WebGLBuffer => ({}) as WebGLBuffer),
    deleteBuffer: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawVectorVertexDotBatch', () => {
  it('should draw nothing and skip every GL call when there are no centers', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const cache = new WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>();

    // before
    drawVectorVertexDotBatch(gl, program, buffer, cache, [], 6, '#ffffff', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(gl.bufferData).not.toHaveBeenCalled();
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should upload one triangle-fan batch covering every dot in a single draw call', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const cache = new WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>();
    const centers = [
      { x: 10, y: 10 },
      { x: 20, y: 20 },
    ];

    // before
    drawVectorVertexDotBatch(gl, program, buffer, cache, centers, 6, '#ffffff', 200, 150, { x: 5, y: 7, zoom: 2 });

    // result
    expect(gl.useProgram).toHaveBeenCalledWith(program);
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 5, 7);
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 2);
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 200, 150);
    expect(gl.bufferData).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);

    const uploaded = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0][1] as Float32Array;

    // the batch covers both dots, so the vertex count (and draw call size) scales with center count
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, uploaded.length / 2);
    expect(uploaded.length % 2).toBe(0);
    // first triangle of the first dot starts at its own center
    expect(uploaded[0]).toBe(10);
    expect(uploaded[1]).toBe(10);
  });

  it('should reuse the cached buffer on a second call with the same centers/size, skipping bufferData', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const cache = new WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>();
    const centers = [{ x: 10, y: 10 }];

    // before — same centers reference and size looked up twice, as consecutive idle render-loop frames would
    drawVectorVertexDotBatch(gl, program, buffer, cache, centers, 6, '#ffffff', 200, 150, IDENTITY_VIEWPORT);

    vi.mocked(gl.createBuffer).mockClear();
    vi.mocked(gl.bufferData).mockClear();

    drawVectorVertexDotBatch(gl, program, buffer, cache, centers, 6, '#ffffff', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(gl.createBuffer).not.toHaveBeenCalled();
    expect(gl.bufferData).not.toHaveBeenCalled();
    expect(gl.deleteBuffer).not.toHaveBeenCalled();
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it('should free the superseded GPU buffer when the same centers are redrawn at a 3rd distinct size — e.g. a continuous zoom gesture', () => {
    // mock — same `centers` reused across 3 different `size`s, mirroring the two selected-vertex
    // batches (outer/inner) plus a subsequent zoom-driven size change on one of them
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const cache = new WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>();
    const centers = [{ x: 10, y: 10 }];

    // before
    drawVectorVertexDotBatch(gl, program, buffer, cache, centers, 6, '#ffffff', 200, 150, IDENTITY_VIEWPORT);
    drawVectorVertexDotBatch(gl, program, buffer, cache, centers, 8, '#ffffff', 200, 150, IDENTITY_VIEWPORT);

    // result — both sizes stay alive (cap is 2), nothing freed yet
    expect(gl.deleteBuffer).not.toHaveBeenCalled();
    expect(cache.get(centers)).toHaveLength(2);

    // before — a 3rd distinct size for the same centers must evict the oldest one, deleting its buffer
    drawVectorVertexDotBatch(gl, program, buffer, cache, centers, 10, '#ffffff', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(gl.deleteBuffer).toHaveBeenCalledTimes(1);
    expect(cache.get(centers)).toHaveLength(2);
    expect(cache.get(centers)?.map((entry) => entry.size)).toEqual([8, 10]);
  });
});
