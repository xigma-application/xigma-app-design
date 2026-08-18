// utils
import { drawEllipseArcGuideLine } from '../drawEllipseArcGuideLine';

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
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('drawEllipseArcGuideLine', () => {
  it('should draw a single line segment from the shape center to the handle position', () => {
    // mock
    const gl = createGlMock();

    // before
    drawEllipseArcGuideLine(gl, {} as WebGLProgram, {} as WebGLBuffer, BOUNDS, 90, '#0d99ff', 0.001, 100, 100, IDENTITY_VIEWPORT, 0);

    // result — negligible strokeWidth keeps the thickening offset out of the way of the coordinate check
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);

    const [call] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = call[1];

    expect(vertices[0]).toBeCloseTo(50, 2); // center.x
    expect(vertices[1]).toBeCloseTo(50, 2); // center.y
    expect(vertices[2]).toBeCloseTo(100, 2); // arcEndAngle 90° (east rim)
    expect(vertices[3]).toBeCloseTo(50, 2);
  });

  it('should rotate the handle endpoint around the bounds center when rotation is given', () => {
    // mock
    const gl = createGlMock();

    // before — handle (100, 50) rotated 90deg around center (50, 50) swings to (50, 100)
    drawEllipseArcGuideLine(gl, {} as WebGLProgram, {} as WebGLBuffer, BOUNDS, 90, '#0d99ff', 0.001, 100, 100, IDENTITY_VIEWPORT, 90);

    // result
    const [call] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = call[1];

    expect(vertices[2]).toBeCloseTo(50, 2);
    expect(vertices[3]).toBeCloseTo(100, 2);
  });

  it('should flip the handle endpoint when flipX/flipY are set', () => {
    // mock
    const gl = createGlMock();

    // before — the default east-rim endpoint (100, 50) mirrors across the center (50, 50) to (0, 50)
    drawEllipseArcGuideLine(
      gl,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      BOUNDS,
      90,
      '#0d99ff',
      0.001,
      100,
      100,
      IDENTITY_VIEWPORT,
      0,
      true,
      false,
    );

    // result
    const [call] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = call[1];

    expect(vertices[2]).toBeCloseTo(0, 2);
    expect(vertices[3]).toBeCloseTo(50, 2);
  });
});
