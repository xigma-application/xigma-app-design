// utils
import { drawEllipseArcRatioGuideArc } from '../drawEllipseArcRatioGuideArc';

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

describe('drawEllipseArcRatioGuideArc', () => {
  it('should draw one line segment per pair of consecutive arc points', () => {
    // mock — majorArc(0, 90) is {majorStart: 90, majorSweep: 270}; 64 total segments scaled by 270/360 -> 48
    const gl = createGlMock();

    // before
    drawEllipseArcRatioGuideArc(gl, {} as WebGLProgram, {} as WebGLBuffer, BOUNDS, 0, 90, '#0d99ff', 0.001, 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(48);
  });

  it('should start the traced curve at the majority arc own start point', () => {
    // mock
    const gl = createGlMock();

    // before — negligible strokeWidth keeps the line-thickening offset out of the coordinate check
    drawEllipseArcRatioGuideArc(gl, {} as WebGLProgram, {} as WebGLBuffer, BOUNDS, 0, 90, '#0d99ff', 0.001, 100, 100, IDENTITY_VIEWPORT, 0);

    // result — majorStart 90° (east rim) sits at (100, 50)
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    expect(vertices[0]).toBeCloseTo(100, 2);
    expect(vertices[1]).toBeCloseTo(50, 2);
  });

  it('should rotate the traced curve around the bounds center when rotation is given', () => {
    // mock
    const gl = createGlMock();

    // before — (100, 50) rotated 90deg around center (50, 50) swings to (50, 100)
    drawEllipseArcRatioGuideArc(
      gl,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      BOUNDS,
      0,
      90,
      '#0d99ff',
      0.001,
      100,
      100,
      IDENTITY_VIEWPORT,
      90,
    );

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    expect(vertices[0]).toBeCloseTo(50, 2);
    expect(vertices[1]).toBeCloseTo(100, 2);
  });

  it('should flip the traced curve when flipX/flipY are set', () => {
    // mock
    const gl = createGlMock();

    // before — the start point (100, 50) mirrors across the center (50, 50) to (0, 50)
    drawEllipseArcRatioGuideArc(
      gl,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      BOUNDS,
      0,
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
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    expect(vertices[0]).toBeCloseTo(0, 2);
    expect(vertices[1]).toBeCloseTo(50, 2);
  });
});
