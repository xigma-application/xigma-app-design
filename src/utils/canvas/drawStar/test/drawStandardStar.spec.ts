// utils
import { drawStandardStar } from '../drawStandardStar';

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

describe('drawStandardStar', () => {
  it('should draw a triangle fan when fill is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStandardStar(
      gl,
      program,
      buffer,
      { fill: '#ffffff', height: 10, points: 5, ratio: 0.382, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
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
    drawStandardStar(
      gl,
      program,
      buffer,
      { height: 10, points: 5, ratio: 0.382, stroke: '#ffffff', width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
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
    drawStandardStar(
      gl,
      program,
      buffer,
      { height: 10, points: 5, ratio: 0.382, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should upload the viewport transform and resolution as uniforms', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStandardStar(
      gl,
      program,
      buffer,
      { fill: '#ffffff', height: 10, points: 5, ratio: 0.382, width: 10, x: 0, y: 0 },
      100,
      200,
      {
        x: 5,
        y: 15,
        zoom: 2,
      },
      false,
      false,
      0,
    );

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 5, 15);
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 2);
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 100, 200);
  });

  it('should center the fan on the bounding rect', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStandardStar(
      gl,
      program,
      buffer,
      { fill: '#ffffff', height: 20, points: 4, ratio: 0.5, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[0]).toBe(5);
    expect(vertices[1]).toBe(10);
  });

  it('should rotate the fan points around the center when rotation is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStandardStar(
      gl,
      program,
      buffer,
      { fill: '#ffffff', height: 20, points: 4, ratio: 0.5, width: 20, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      90,
    );

    // result
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[2]).toBeCloseTo(20);
    expect(vertices[3]).toBeCloseTo(10);
  });

  it('should mirror the fan points around the center when flipX/flipY are given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — center (10, 10); the first raw outer point (top, angle -90) sits at (10, 0);
    drawStandardStar(
      gl,
      program,
      buffer,
      { fill: '#ffffff', height: 20, points: 4, ratio: 0.5, width: 20, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
      true,
      true,
      0,
    );

    // result
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[2]).toBeCloseTo(10);
    expect(vertices[3]).toBeCloseTo(20);
  });
});
