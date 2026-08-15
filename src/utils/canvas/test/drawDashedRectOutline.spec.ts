// others
import { FONT_SIZE_GUIDE_DASH_GAP_PX, FONT_SIZE_GUIDE_DASH_LENGTH_PX } from 'constant/canvas';

// utils
import { drawDashedRectOutline } from '../drawDashedRectOutline';
import { hexToRgbaFloat } from '../hexToRgbaFloat';

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

const RECT = { height: 100, width: 100, x: 0, y: 0 };
const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const expectedDashCount = (perimeter: number, zoom: number): number => {
  const patternLength = (FONT_SIZE_GUIDE_DASH_LENGTH_PX + FONT_SIZE_GUIDE_DASH_GAP_PX) / zoom;

  return Math.max(1, Math.round(perimeter / patternLength));
};

describe('drawDashedRectOutline', () => {
  it('should draw the outline as disconnected line segments, not a closed loop', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDashedRectOutline(gl, program, buffer, RECT, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    const expectedDashes = expectedDashCount(400, IDENTITY_VIEWPORT.zoom);

    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, expectedDashes * 2);
  });

  it('should color the dashes with the given stroke color', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDashedRectOutline(gl, program, buffer, RECT, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), hexToRgbaFloat('#0d99ff'));
  });

  it('should double the dash count when zoomed in 2x, keeping each dash a constant size on screen', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDashedRectOutline(gl, program, buffer, RECT, '#0d99ff', 100, 100, { x: 0, y: 0, zoom: 2 }, 0);

    // result
    const expectedDashes = expectedDashCount(400, 2);

    expect(expectedDashes).toBeGreaterThan(expectedDashCount(400, 1));
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, expectedDashes * 2);
  });

  it('should leave gaps between dashes instead of tracing a continuous outline', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDashedRectOutline(gl, program, buffer, { height: 10, width: 10, x: 0, y: 0 }, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    // the first dash starts at the top-left corner
    expect(vertices[0]).toBeCloseTo(0);
    expect(vertices[1]).toBeCloseTo(0);

    // the dash's own end point (index 2/3) must stop short of the next dash's start (index 4/5)
    const dashEnd = { x: vertices[2], y: vertices[3] };
    const nextDashStart = { x: vertices[4], y: vertices[5] };

    expect(dashEnd).not.toEqual(nextDashStart);
  });

  it('should rotate the dashes around the rect center when rotation is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDashedRectOutline(gl, program, buffer, { height: 10, width: 10, x: 0, y: 0 }, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 90);

    // result — the top-left corner (0,0) rotates 90 degrees around the center (5,5) to (10,0)
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    expect(vertices[0]).toBeCloseTo(10);
    expect(vertices[1]).toBeCloseTo(0);
  });
});
