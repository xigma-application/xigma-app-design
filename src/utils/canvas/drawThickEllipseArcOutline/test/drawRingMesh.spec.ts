// utils
import { drawRingMesh } from '../drawRingMesh';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    FLOAT: 5126,
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

describe('drawRingMesh', () => {
  it('should upload the vertices as a Float32Array and draw a triangle mesh from them', () => {
    // mock
    const gl = createGlMock();
    const vertices = [0, 0, 10, 0, 10, 10, 0, 10];

    // before
    drawRingMesh(gl, {} as WebGLProgram, {} as WebGLBuffer, vertices, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.bufferData).toHaveBeenCalledWith(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, vertices.length / 2);
  });

  it('should forward the viewport offset and zoom as uniforms', () => {
    // mock
    const gl = createGlMock();
    const viewport = { x: 12, y: 34, zoom: 2 };

    // before
    drawRingMesh(gl, {} as WebGLProgram, {} as WebGLBuffer, [], '#0d99ff', 100, 100, viewport);

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 12, 34);
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 2);
  });
});
