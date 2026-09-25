// utils
import { drawThickEllipseShapeOutline } from '../drawThickEllipseShapeOutline';

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

describe('drawThickEllipseShapeOutline', () => {
  it('should draw a band along the rounded arc shape in one triangles pass', () => {
    // mock
    const gl = createGlMock();

    // before
    drawThickEllipseShapeOutline(
      gl,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { arcEndAngle: 180, cornerRadius: 10, height: 100, width: 100, x: 0, y: 0 },
      '#0d99ff',
      2,
      100,
      100,
      { x: 0, y: 0, zoom: 1 },
      false,
      false,
      0,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(vi.mocked(gl.drawArrays).mock.calls[0][0]).toBe(4);
  });
});
