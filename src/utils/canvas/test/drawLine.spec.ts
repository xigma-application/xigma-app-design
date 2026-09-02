// utils
import { drawLine } from '../drawLine';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
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

describe('drawLine', () => {
  it('should draw the segment as a single filled-triangles pass', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawLine(gl, program, buffer, { x1: 0, x2: 10, y1: 0, y2: 0 }, '#0d99ff', 2, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should treat strokeWidth as world units, so its on-screen thickness scales with zoom like real content', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawLine(gl, program, buffer, { x1: 0, x2: 10, y1: 0, y2: 0 }, '#0d99ff', 4, 100, 100, { x: 0, y: 0, zoom: 2 });

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];
    // horizontal segment's normal is vertical, so the y-offset from the centerline is the
    // world-space half width: strokeWidth isn't divided by zoom, so halfWidth = 4 / 2 = 2
    // regardless of the viewport's zoom level (the vertex shader applies u_zoom uniformly)
    const worldHalfWidth = Math.abs(vertices[1]);

    expect(worldHalfWidth).toBeCloseTo(2);
    expect(worldHalfWidth * 2).toBeCloseTo(4); // screen pixels at zoom 2: worldHalfWidth * zoom
  });

  it('should offset the quad perpendicular to the segment direction', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawLine(gl, program, buffer, { x1: 0, x2: 10, y1: 0, y2: 0 }, '#0d99ff', 2, 100, 100, IDENTITY_VIEWPORT);

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];
    const xValues = Array.from(vertices).filter((_, i) => i % 2 === 0);

    // a horizontal segment offset perpendicular to itself should not shift along x at all
    expect(xValues.every((x) => x === 0 || x === 10)).toBe(true);
  });

  it('should default to fully opaque when no alpha is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawLine(gl, program, buffer, { x1: 0, x2: 10, y1: 0, y2: 0 }, '#0d99ff', 2, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), [expect.any(Number), expect.any(Number), expect.any(Number), 1]);
  });

  it('should pass a given alpha through to the color uniform', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawLine(gl, program, buffer, { x1: 0, x2: 10, y1: 0, y2: 0 }, '#0d99ff', 2, 100, 100, IDENTITY_VIEWPORT, 0.5);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), [expect.any(Number), expect.any(Number), expect.any(Number), 0.5]);
  });

  it('should not draw a degenerate zero-length segment', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawLine(gl, program, buffer, { x1: 5, x2: 5, y1: 5, y2: 5 }, '#0d99ff', 2, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
