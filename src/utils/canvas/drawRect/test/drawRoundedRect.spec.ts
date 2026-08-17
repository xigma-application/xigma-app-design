// utils
import { drawRoundedRect } from '../drawRoundedRect';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
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
const CENTER = { x: 50, y: 30 };

describe('drawRoundedRect', () => {
  it('should draw a filled triangle fan when fill is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRoundedRect(
      gl,
      program,
      buffer,
      { cornerRadius: 10, fill: '#ffffff', height: 60, width: 100, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
      0,
      CENTER,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
  });

  it('should draw an outline when stroke is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRoundedRect(
      gl,
      program,
      buffer,
      { cornerRadius: 10, height: 60, stroke: '#ffffff', width: 100, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
      0,
      CENTER,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, expect.any(Number));
  });

  it('should draw nothing when neither fill nor stroke is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRoundedRect(gl, program, buffer, { cornerRadius: 10, height: 60, width: 100, x: 0, y: 0 }, 100, 100, IDENTITY_VIEWPORT, 0, CENTER);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should upload the viewport transform and resolution as uniforms', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRoundedRect(
      gl,
      program,
      buffer,
      { cornerRadius: 10, fill: '#ffffff', height: 60, width: 100, x: 0, y: 0 },
      100,
      200,
      { x: 5, y: 15, zoom: 2 },
      0,
      CENTER,
    );

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 5, 15);
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 2);
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 100, 200);
  });

  it('should rotate every point around the given center when rotation is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — the nw arc's first point sits at (0, 10) before rotation; rotating 90deg around
    // (50, 30) swings it to (70, -20)
    drawRoundedRect(
      gl,
      program,
      buffer,
      { cornerRadius: 10, fill: '#ffffff', height: 60, width: 100, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
      90,
      CENTER,
    );

    // result — vertices[0,1] is the fan center; vertices[2,3] is the first rotated geometry point
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[2]).toBeCloseTo(70);
    expect(vertices[3]).toBeCloseTo(-20);
  });
});
