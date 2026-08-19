// utils
import { drawPenPreview } from '../drawPenPreview';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => ({})),
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

describe('drawPenPreview', () => {
  it('should draw nothing when there is no preview segment and no hover vertex', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawPenPreview(gl, program, buffer, null, null, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw a vector stroke for the preview segment from the pen origin to the pointer', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const preview = { from: { x: 0, y: 0 }, tangentFromOffset: null, to: { x: 10, y: 10 } };

    // before
    drawPenPreview(gl, program, buffer, preview, null, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, expect.any(Number));
  });

  it('should draw a snap-indicator ellipse centered on the hovered vertex', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const hoverVertex = { nodeId: 'node', point: { x: 5, y: 5 }, vertexId: 'vertex' };

    // before
    drawPenPreview(gl, program, buffer, null, hoverVertex, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, expect.any(Number));
  });

  it('should draw both the preview stroke and the snap-indicator ellipse together', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const preview = { from: { x: 0, y: 0 }, tangentFromOffset: null, to: { x: 10, y: 10 } };
    const hoverVertex = { nodeId: 'node', point: { x: 10, y: 10 }, vertexId: 'vertex' };

    // before
    drawPenPreview(gl, program, buffer, preview, hoverVertex, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });
});
