// utils
import { drawThickStarOutline } from '../drawThickStarOutline';

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

describe('drawThickStarOutline', () => {
  it('should draw the border as a single filled-triangles pass sized for the vertex count', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawThickStarOutline(
      gl,
      program,
      buffer,
      { height: 20, points: 3, ratio: 0.5, width: 10, x: 0, y: 0 },
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6 * 6);
  });

  it('should draw a hollow border, not a filled shape', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    // ratio 1 collapses the star to a diamond (points=2); 2px stroke at zoom 1 => halfWidth = 1;
    // rx = 5, so outer rx = 6, inner rx = 4
    drawThickStarOutline(
      gl,
      program,
      buffer,
      { height: 20, points: 2, ratio: 1, width: 10, x: 0, y: 0 },
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    // the first quad's vertex layout is [outer0, outer1, inner1, outer0, inner1, inner0]
    const outerRightEdge = vertices[2];
    const innerRightEdge = vertices[8];

    // the outer ring reaches past the diamond's own right vertex (cx + rx = 10); a filled shape never would
    expect(outerRightEdge).toBeCloseTo(11);
    // the inner ring stops short of the full radius (cx + rx = 10); a filled shape would reach all the way there
    expect(innerRightEdge).toBeCloseTo(9);
  });

  it('should keep the border a constant size on screen regardless of zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawThickStarOutline(gl, program, buffer, { height: 20, points: 2, ratio: 1, width: 10, x: 0, y: 0 }, '#0d99ff', 8, 100, 100, {
      x: 0,
      y: 0,
      zoom: 2,
    });

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];
    // the outer ring's rightmost point sits at (cx + rx + halfWidth); at zoom 2 with an 8px border,
    // halfWidth in world space is (8 / 2) / 2 = 2, so it reaches 5 (cx) + 5 (rx) + 2 = 12
    const worldMaxX = Math.max(...Array.from(vertices).filter((_, index) => index % 2 === 0));

    expect(worldMaxX).toBeCloseTo(12);
  });
});
