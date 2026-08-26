// utils
import { drawVectorThickStrokeVertices } from '../drawVectorThickStrokeVertices';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
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

describe('drawVectorThickStrokeVertices', () => {
  it('should draw nothing and skip every GL call when there are no vertices', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorThickStrokeVertices(gl, program, buffer, [], '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.bufferData).not.toHaveBeenCalled();
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should upload the viewport uniforms and draw one triangles pass matching the vertex count', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const vertices = [0, 0, 10, 0, 10, 1, 0, 0, 10, 1, 0, 1];

    // before
    drawVectorThickStrokeVertices(gl, program, buffer, vertices, '#0d99ff', 200, 150, { x: 5, y: 7, zoom: 2 });

    // result
    expect(gl.useProgram).toHaveBeenCalledWith(program);
    expect(gl.bindBuffer).toHaveBeenCalledWith(gl.ARRAY_BUFFER, buffer);
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 5, 7); // u_viewportOffset
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 2); // u_zoom
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 200, 150); // u_resolution
    expect(gl.bufferData).toHaveBeenCalledTimes(1);
    expect(gl.bufferData).toHaveBeenCalledWith(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, vertices.length / 2);
  });

  it('should default to fully opaque, and forward an explicit alpha into the color uniform', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const vertices = [0, 0, 10, 0, 10, 1];

    // before
    drawVectorThickStrokeVertices(gl, program, buffer, vertices, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);
    drawVectorThickStrokeVertices(gl, program, buffer, vertices, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0.5);

    // result
    expect(gl.uniform4fv).toHaveBeenNthCalledWith(1, expect.anything(), [13 / 255, 153 / 255, 1, 1]);
    expect(gl.uniform4fv).toHaveBeenNthCalledWith(2, expect.anything(), [13 / 255, 153 / 255, 1, 0.5]);
  });
});
