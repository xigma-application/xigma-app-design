// utils
import { drawThickEllipseArcOutline } from '../drawThickEllipseArcOutline';

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
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };
const TINY_STROKE = 0.001;

describe('drawThickEllipseArcOutline', () => {
  it('should draw only the ring-band mesh, with no spoke lines, when there is no angular cut', () => {
    // mock — arcStartAngle === arcEndAngle: a full circle, hasEllipseArc is false
    const gl = createGlMock();
    const ellipse = { ...BOUNDS, arcEndAngle: 90, arcStartAngle: 90 };

    // before
    drawThickEllipseArcOutline(
      gl,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      ellipse,
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
  });

  it('should draw the ring-band mesh plus two spoke lines when an angular cut exists', () => {
    // mock
    const gl = createGlMock();
    const ellipse = { ...BOUNDS, arcEndAngle: 0, arcStartAngle: 90 };

    // before
    drawThickEllipseArcOutline(
      gl,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      ellipse,
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(3);
  });

  it('should triangulate an extra band for the inner hole rim once arcRatio is above 0', () => {
    // mock
    const glNoRatio = createGlMock();
    const glWithRatio = createGlMock();
    const cutEllipse = { ...BOUNDS, arcEndAngle: 0, arcStartAngle: 90 };

    // before
    drawThickEllipseArcOutline(
      glNoRatio,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      cutEllipse,
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );
    drawThickEllipseArcOutline(
      glWithRatio,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { ...cutEllipse, arcRatio: 0.5 },
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result — the combined mesh (first bufferData call) has more vertices with the hole band added
    const [meshCallNoRatio] = (glNoRatio.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const [meshCallWithRatio] = (glWithRatio.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    expect((meshCallWithRatio[1] as Float32Array).length).toBeGreaterThan((meshCallNoRatio[1] as Float32Array).length);
  });

  it('should anchor the spoke lines at the hole rim instead of dead center once arcRatio is above 0', () => {
    // mock — cut 0->90 (majorArc {majorStart: 90, majorSweep: 270}); holeRect radius is 0.5 * 50 = 25
    const gl = createGlMock();
    const ellipse = { ...BOUNDS, arcEndAngle: 90, arcRatio: 0.5, arcStartAngle: 0 };

    // before
    drawThickEllipseArcOutline(
      gl,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      ellipse,
      '#0d99ff',
      TINY_STROKE,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result — first spoke line is the second bufferData call, starting at the hole rim (75, 50)
    const calls = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const [, firstSpokeCall] = calls;
    const firstSpokeVertices: Float32Array = firstSpokeCall[1];

    expect(firstSpokeVertices[0]).toBeCloseTo(75, 2);
    expect(firstSpokeVertices[1]).toBeCloseTo(50, 2);
  });

  it('should anchor the spoke lines at dead center when arcRatio is 0', () => {
    // mock — same cut as above, no ratio
    const gl = createGlMock();
    const ellipse = { ...BOUNDS, arcEndAngle: 90, arcStartAngle: 0 };

    // before
    drawThickEllipseArcOutline(
      gl,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      ellipse,
      '#0d99ff',
      TINY_STROKE,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    const calls = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const [, firstSpokeCall] = calls;
    const firstSpokeVertices: Float32Array = firstSpokeCall[1];

    expect(firstSpokeVertices[0]).toBeCloseTo(50, 2);
    expect(firstSpokeVertices[1]).toBeCloseTo(50, 2);
  });

  it('should trace the complementary arc when arcRatioInverted is set', () => {
    // mock — majorArc(0, 90) inverted resolves to (90, 360): the mesh should differ from the non-inverted one
    const glNormal = createGlMock();
    const glInverted = createGlMock();
    const ellipse = { ...BOUNDS, arcEndAngle: 90, arcStartAngle: 0 };

    // before
    drawThickEllipseArcOutline(
      glNormal,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      ellipse,
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );
    drawThickEllipseArcOutline(
      glInverted,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { ...ellipse, arcRatioInverted: true },
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    const [meshCallNormal] = (glNormal.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const [meshCallInverted] = (glInverted.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    expect(meshCallInverted[1]).not.toEqual(meshCallNormal[1]);
  });

  it('should mirror the traced mesh across the center when flipX/flipY are set', () => {
    // mock
    const glUnflipped = createGlMock();
    const glFlipped = createGlMock();
    const ellipse = { ...BOUNDS, arcEndAngle: 90, arcStartAngle: 0 };

    // before
    drawThickEllipseArcOutline(
      glUnflipped,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      ellipse,
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );
    drawThickEllipseArcOutline(
      glFlipped,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      ellipse,
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
      true,
      true,
      0,
    );

    // result
    const [meshCallUnflipped] = (glUnflipped.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const [meshCallFlipped] = (glFlipped.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    expect(meshCallFlipped[1]).not.toEqual(meshCallUnflipped[1]);
  });
});
