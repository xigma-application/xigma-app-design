// utils
import { drawThickPolygonOutline } from '../drawThickPolygonOutline';

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

describe('drawThickPolygonOutline', () => {
  it('should draw the border as a single filled-triangles pass sized for the side count', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawThickPolygonOutline(
      gl,
      program,
      buffer,
      { height: 20, sides: 6, width: 10, x: 0, y: 0 },
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
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6 * 6);
  });

  it('should draw a hollow border, not a filled polygon', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawThickPolygonOutline(
      gl,
      program,
      buffer,
      { height: 20, sides: 4, width: 10, x: 0, y: 0 },
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
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    const outerRightEdge = vertices[2];
    const innerRightEdge = vertices[8];

    expect(outerRightEdge).toBeCloseTo(11);
    expect(innerRightEdge).toBeCloseTo(9);
  });

  it('should keep the border a constant size on screen regardless of zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawThickPolygonOutline(
      gl,
      program,
      buffer,
      { height: 20, sides: 4, width: 10, x: 0, y: 0 },
      '#0d99ff',
      8,
      100,
      100,
      {
        x: 0,
        y: 0,
        zoom: 2,
      },
      false,
      false,
      0,
    );

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];
    const worldMaxX = Math.max(...Array.from(vertices).filter((_, index) => index % 2 === 0));

    expect(worldMaxX).toBeCloseTo(12);
  });

  it('should rotate the outer ring points around the center when rotation is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawThickPolygonOutline(
      gl,
      program,
      buffer,
      { height: 10, sides: 4, width: 10, x: 0, y: 0 },
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      90,
    );

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    expect(vertices[2]).toBeCloseTo(5);
    expect(vertices[3]).toBeCloseTo(11);
  });

  it('should mirror the outer ring points around the center when flipX/flipY are given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — square rx = ry = 5, halfWidth = 1 => outer radius 6; unrotated outer1 (right edge)
    drawThickPolygonOutline(
      gl,
      program,
      buffer,
      { height: 10, sides: 4, width: 10, x: 0, y: 0 },
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
      true,
      false,
      0,
    );

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    expect(vertices[2]).toBeCloseTo(-1);
    expect(vertices[3]).toBeCloseTo(5);
  });

  it('should trace the rounded boundary, not the sharp one, once cornerRadius is set', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — a hexagon's rounded ring has 6 * (ROUNDED_POLYGON_CORNER_SEGMENTS + 1) = 54 points
    // per edge (outer/inner), instead of the sharp shape's plain 6
    drawThickPolygonOutline(
      gl,
      program,
      buffer,
      { cornerRadius: 2, height: 20, sides: 6, width: 20, x: 0, y: 0 },
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
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 54 * 6);
  });
});
