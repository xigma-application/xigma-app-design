// types
import { TRectChunk } from '../types';

// utils
import { drawRectChunk } from '../drawRectChunk';

const createGl = (compiles = true): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 1,
    FLOAT: 5,
    STREAM_DRAW: 3,
    TRIANGLES: 4,
    attachShader: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    compileShader: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    createProgram: vi.fn(() => ({})),
    createShader: vi.fn(() => (compiles ? {} : null)),
    disableVertexAttribArray: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    getShaderParameter: vi.fn(() => true),
    getUniformLocation: vi.fn(() => ({})),
    linkProgram: vi.fn(),
    shaderSource: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const createChunk = (minX: number, minY: number, maxX: number, maxY: number): TRectChunk => ({
  baseOpacity: 1,
  bounds: { maxX, maxY, minX, minY },
  buffer: {} as WebGLBuffer,
  nodes: [],
  vertexCount: 6,
});

describe('drawRectChunk', () => {
  it('should draw a chunk that intersects the viewport', () => {
    // mock
    const gl = createGl();

    // before
    drawRectChunk(gl, createChunk(10, 10, 50, 50), 100, 100, { x: 0, y: 0, zoom: 1 });

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(4, 0, 6);
  });

  it.each([
    ['left of', createChunk(-50, 10, -10, 50)],
    ['above', createChunk(10, -50, 50, -10)],
    ['right of', createChunk(150, 10, 200, 50)],
    ['below', createChunk(10, 150, 50, 200)],
  ])('should skip a chunk entirely %s the viewport', (_, chunk) => {
    // mock
    const gl = createGl();

    // before
    drawRectChunk(gl, chunk, 100, 100, { x: 0, y: 0, zoom: 1 });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the program is unavailable', () => {
    // mock
    const gl = createGl(false);

    // before
    drawRectChunk(gl, createChunk(10, 10, 50, 50), 100, 100, { x: 0, y: 0, zoom: 1 });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
