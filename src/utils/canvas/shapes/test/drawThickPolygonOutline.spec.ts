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
    // 2px stroke at zoom 1 => halfWidth = 1; polygon rx = 5, so outer rx = 6, inner rx = 4
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
      0,
    );

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];
    // the outer ring's rightmost point sits at (cx + rx + halfWidth); at zoom 2 with an 8px border,
    // halfWidth in world space is (8 / 2) / 2 = 2, so it reaches 5 (cx) + 5 (rx) + 2 = 12
    const worldMaxX = Math.max(...Array.from(vertices).filter((_, index) => index % 2 === 0));

    expect(worldMaxX).toBeCloseTo(12);
  });

  it('should rotate the outer ring points around the center when rotation is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    // square rx = ry = 5, halfWidth = 1 => outer radius 6; unrotated outer1 (right edge) would be (11, 5)
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
      90,
    );

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    expect(vertices[2]).toBeCloseTo(5);
    expect(vertices[3]).toBeCloseTo(11);
  });
});
