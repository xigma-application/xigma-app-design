// utils
import { drawEllipseArcHandle } from '../drawEllipseArcHandle';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
    TRIANGLE_FAN: 6,
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

describe('drawEllipseArcHandle', () => {
  it('should draw a fill and a stroke pass for the handle, and nothing else, without a dot', () => {
    // mock
    const gl = createGlMock();

    // before
    drawEllipseArcHandle(gl, {} as WebGLProgram, {} as WebGLBuffer, BOUNDS, 90, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it('should draw an extra fill pass for the inner dot when withDot is set', () => {
    // mock
    const gl = createGlMock();

    // before
    drawEllipseArcHandle(
      gl,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      BOUNDS,
      90,
      '#0d99ff',
      100,
      100,
      IDENTITY_VIEWPORT,
      0,
      false,
      false,
      null,
      true,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(3);
  });

  it('should position the handle at the given arcEndAngle by default', () => {
    // mock
    const gl = createGlMock();

    // before — arcEndAngle 90° (east rim) sits at (100, 50)
    drawEllipseArcHandle(gl, {} as WebGLProgram, {} as WebGLBuffer, BOUNDS, 90, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result — the fill fan's center vertex is the handle's own position
    const [fillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = fillCall[1];

    expect(vertices[0]).toBeCloseTo(100, 4);
    expect(vertices[1]).toBeCloseTo(50, 4);
  });

  it('should use overridePosition instead of computing one from arcEndAngle when given', () => {
    // mock
    const gl = createGlMock();

    // before
    drawEllipseArcHandle(gl, {} as WebGLProgram, {} as WebGLBuffer, BOUNDS, 90, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0, false, false, {
      x: 20,
      y: 30,
    });

    // result
    const [fillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = fillCall[1];

    expect(vertices[0]).toBeCloseTo(20, 4);
    expect(vertices[1]).toBeCloseTo(30, 4);
  });

  it('should rotate the handle position around the bounds center when rotation is given', () => {
    // mock
    const gl = createGlMock();

    // before — (100, 50) rotated 90deg around center (50, 50) swings to (50, 100)
    drawEllipseArcHandle(gl, {} as WebGLProgram, {} as WebGLBuffer, BOUNDS, 90, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 90);

    // result
    const [fillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = fillCall[1];

    expect(vertices[0]).toBeCloseTo(50, 4);
    expect(vertices[1]).toBeCloseTo(100, 4);
  });
});
