// utils
import { drawThickOutline } from '../drawThickOutline';

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

describe('drawThickOutline', () => {
  it('should draw the border as a single filled-triangles pass', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawThickOutline(gl, program, buffer, { height: 20, width: 10, x: 0, y: 0 }, '#0d99ff', 2, 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 24);
  });

  it('should keep the border a constant size on screen regardless of zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawThickOutline(
      gl,
      program,
      buffer,
      { height: 20, width: 10, x: 0, y: 0 },
      '#0d99ff',
      4,
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
    const worldHalfWidth = Math.abs(vertices[0]);

    expect(worldHalfWidth).toBeCloseTo(1);
    expect(worldHalfWidth * 2).toBeCloseTo(2); // screen pixels: worldHalfWidth * zoom
  });

  it('should draw a hollow rectangular border, not a filled rect', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawThickOutline(gl, program, buffer, { height: 20, width: 10, x: 0, y: 0 }, '#0d99ff', 2, 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];
    const yValues = Array.from(vertices).filter((_, i) => i % 2 === 1);

    expect(yValues).toContain(1);
    expect(yValues).toContain(19);
  });

  it('should rotate all outline vertices around the center when rotation is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawThickOutline(gl, program, buffer, { height: 20, width: 10, x: 0, y: 0 }, '#0d99ff', 2, 100, 100, IDENTITY_VIEWPORT, 90);

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    expect(vertices[0]).toBeCloseTo(16);
    expect(vertices[1]).toBeCloseTo(4);
  });

  it('should trace the rounded boundary, not the sharp one, once cornerRadius is set', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — 4 corners * (ROUNDED_RECT_CORNER_SEGMENTS + 1) = 36 points per ring edge, instead of
    // the sharp rect's plain 4 corners
    drawThickOutline(
      gl,
      program,
      buffer,
      { cornerRadius: 5, height: 100, width: 100, x: 0, y: 0 },
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
      0,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 36 * 6);
  });
});
