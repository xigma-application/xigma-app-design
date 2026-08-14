// others
import { DASH_GAP_PX, DASH_LENGTH_PX } from 'constant/canvas';

// utils
import { drawDashedEllipseOutline } from '../drawDashedEllipseOutline';
import { getEllipseCircumference } from '../getEllipseCircumference';
import { buildEllipseArcLengthTable } from '../buildEllipseArcLengthTable';
import { hexToRgbaFloat } from '../../hexToRgbaFloat';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINES: 1,
    STATIC_DRAW: 35044,
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

const CIRCLE = { height: 200, width: 200, x: 0, y: 0 };
const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const expectedDashCount = (widthPx: number, heightPx: number, zoom: number): number => {
  const circumference = getEllipseCircumference(buildEllipseArcLengthTable(widthPx, heightPx));
  const patternLength = (DASH_LENGTH_PX + DASH_GAP_PX) / zoom;

  return Math.max(1, Math.round(circumference / patternLength));
};

describe('drawDashedEllipseOutline', () => {
  it('should draw the outline as disconnected line segments, not a closed loop', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDashedEllipseOutline(gl, program, buffer, CIRCLE, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result — one 2-point segment per dash
    const expectedDashes = expectedDashCount(CIRCLE.width, CIRCLE.height, IDENTITY_VIEWPORT.zoom);

    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, expectedDashes * 2);
  });

  it('should color the dashes with the given stroke color', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDashedEllipseOutline(gl, program, buffer, CIRCLE, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), hexToRgbaFloat('#0d99ff'));
  });

  it('should double the dash count when zoomed in 2x, keeping each dash a constant size on screen', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDashedEllipseOutline(gl, program, buffer, CIRCLE, '#0d99ff', 100, 100, { x: 0, y: 0, zoom: 2 }, 0);

    // result
    const expectedDashes = expectedDashCount(CIRCLE.width, CIRCLE.height, 2);

    expect(expectedDashes).toBeGreaterThan(expectedDashCount(CIRCLE.width, CIRCLE.height, 1));
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, expectedDashes * 2);
  });

  it('should halve the dash count when zoomed out 2x', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDashedEllipseOutline(gl, program, buffer, CIRCLE, '#0d99ff', 100, 100, { x: 0, y: 0, zoom: 0.5 }, 0);

    // result
    const expectedDashes = expectedDashCount(CIRCLE.width, CIRCLE.height, 0.5);

    expect(expectedDashes).toBeLessThan(expectedDashCount(CIRCLE.width, CIRCLE.height, 1));
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, expectedDashes * 2);
  });

  it('should leave gaps between dashes instead of tracing a continuous curve', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — the first dash starts at the rightmost point of the circle (10,5)
    drawDashedEllipseOutline(gl, program, buffer, { height: 10, width: 10, x: 0, y: 0 }, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    expect(vertices[0]).toBeCloseTo(10);
    expect(vertices[1]).toBeCloseTo(5);

    // the dash's own end point (index 2/3) must stop short of the next dash's start (index 4/5)
    const dashEnd = { x: vertices[2], y: vertices[3] };
    const nextDashStart = { x: vertices[4], y: vertices[5] };

    expect(dashEnd).not.toEqual(nextDashStart);
  });

  it('should rotate the dashes around the center when rotation is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDashedEllipseOutline(gl, program, buffer, { height: 10, width: 10, x: 0, y: 0 }, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 90);

    // result — the rightmost point (10,5) rotates 90 degrees around the center (5,5) to (5,10)
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    expect(vertices[0]).toBeCloseTo(5);
    expect(vertices[1]).toBeCloseTo(10);
  });
});
