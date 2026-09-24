// utils
import { createRectBatch } from '../createRectBatch';
import { flushRectBatch } from '../flushRectBatch';

const createGl = (compiles: boolean): WebGL2RenderingContext =>
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

const VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('flushRectBatch', () => {
  it('should draw the accumulated vertices in one call and reset the batch', () => {
    // mock
    const gl = createGl(true);
    const batch = createRectBatch();

    batch.floatCount = 72;

    // before
    flushRectBatch(gl, batch, 100, 100, VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(4, 0, 12);
    expect(batch.floatCount).toBe(0);
  });

  it('should draw nothing for an empty batch', () => {
    // mock
    const gl = createGl(true);

    // before
    flushRectBatch(gl, createRectBatch(), 100, 100, VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should drop the vertices when the program is unavailable', () => {
    // mock
    const gl = createGl(false);
    const batch = createRectBatch();

    batch.floatCount = 36;

    // before
    flushRectBatch(gl, batch, 100, 100, VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
    expect(batch.floatCount).toBe(0);
  });
});
