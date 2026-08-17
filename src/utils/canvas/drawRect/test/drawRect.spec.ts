// utils
import { drawRect } from '../drawRect';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
    TRIANGLE_FAN: 6,
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

describe('drawRect', () => {
  it('should delegate to the rounded triangle-fan rendering when cornerRadius is set', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRect(
      gl,
      program,
      buffer,
      { cornerRadius: 10, fill: '#ffffff', height: 60, width: 100, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
      0,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
    expect(gl.drawArrays).not.toHaveBeenCalledWith(gl.TRIANGLES, expect.anything(), expect.anything());
  });

  it('should delegate to the plain quad rendering when cornerRadius is 0', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRect(gl, program, buffer, { cornerRadius: 0, fill: '#ffffff', height: 10, width: 10, x: 0, y: 0 }, 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
    expect(gl.drawArrays).not.toHaveBeenCalledWith(gl.TRIANGLE_FAN, expect.anything(), expect.anything());
  });

  it('should delegate to the plain quad rendering when cornerRadius is absent entirely', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRect(gl, program, buffer, { fill: '#ffffff', height: 10, width: 10, x: 0, y: 0 }, 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should default the rotation center to the rect’s own center when none is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRect(gl, program, buffer, { fill: '#ffffff', height: 10, width: 10, x: 0, y: 0 }, 100, 100, IDENTITY_VIEWPORT, 90);

    // result — the rect's own nw corner (0, 0) rotated 90deg around its own default center (5, 5)
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[0]).toBeCloseTo(10);
    expect(vertices[1]).toBeCloseTo(0);
  });

  it("should rotate around an explicitly given center instead of the rect's own, when one is passed", () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — the rect's own center is (5, 5); rotating its top-right corner (10, 0) around the
    // explicit center (0, 0) instead
    drawRect(gl, program, buffer, { fill: '#ffffff', height: 10, width: 10, x: 0, y: 0 }, 100, 100, IDENTITY_VIEWPORT, 90, {
      x: 0,
      y: 0,
    });

    // result
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[2]).toBeCloseTo(0);
    expect(vertices[3]).toBeCloseTo(10);
  });
});
