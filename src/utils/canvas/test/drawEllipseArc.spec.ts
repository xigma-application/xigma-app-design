// utils
import { drawEllipseArc, TDrawableEllipseArc } from '../drawEllipseArc';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
    TRIANGLE_FAN: 6,
    TRIANGLE_STRIP: 5,
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
const ELLIPSE: TDrawableEllipseArc = {
  arcEndAngle: 90,
  arcStartAngle: 0,
  fill: '#ff0000',
  height: 100,
  stroke: '#000000',
  width: 100,
  x: 0,
  y: 0,
};

describe('drawEllipseArc', () => {
  it('should fill using a TRIANGLE_FAN from center when arcRatio is 0', () => {
    // mock
    const gl = createGlMock();

    // before
    drawEllipseArc(gl, {} as WebGLProgram, {} as WebGLBuffer, ELLIPSE, 100, 100, IDENTITY_VIEWPORT, false, false, 0);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
  });

  it('should fill using a TRIANGLE_STRIP between outer and inner points once arcRatio is above 0', () => {
    // mock
    const gl = createGlMock();

    // before
    drawEllipseArc(gl, {} as WebGLProgram, {} as WebGLBuffer, { ...ELLIPSE, arcRatio: 0.5 }, 100, 100, IDENTITY_VIEWPORT, false, false, 0);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_STRIP, 0, expect.any(Number));
  });

  it('should skip the fill draw entirely when no fill color is given', () => {
    // mock
    const gl = createGlMock();

    // before
    drawEllipseArc(
      gl,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { ...ELLIPSE, fill: undefined },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
  });

  it('should stroke the outline with a LINE_LOOP', () => {
    // mock
    const gl = createGlMock();

    // before
    drawEllipseArc(gl, {} as WebGLProgram, {} as WebGLBuffer, ELLIPSE, 100, 100, IDENTITY_VIEWPORT, false, false, 0);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, expect.any(Number));
  });

  it('should skip the stroke draw entirely when no stroke color is given', () => {
    // mock
    const gl = createGlMock();

    // before
    drawEllipseArc(
      gl,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { ...ELLIPSE, stroke: undefined },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalledWith(gl.LINE_LOOP, 0, expect.any(Number));
  });

  it('should route the outline to the complementary arc when arcRatioInverted is set', () => {
    // mock
    const gl = createGlMock();

    // before — majorArc(0, 90) inverted resolves to (90, 360): first outer point becomes the north
    // rim (50, 0) instead of the non-inverted east rim (100, 50)
    drawEllipseArc(
      gl,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { ...ELLIPSE, arcRatioInverted: true },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result — the fill call is the first bufferData call; index 2/3 is the first outer point (after center)
    const [fillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = fillCall[1];

    expect(vertices[2]).toBeCloseTo(50, 4);
    expect(vertices[3]).toBeCloseTo(0, 4);
  });
});
