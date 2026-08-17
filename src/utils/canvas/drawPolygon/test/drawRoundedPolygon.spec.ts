// utils
import { drawRoundedPolygon } from '../drawRoundedPolygon';

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
const TRIANGLE = { cornerRadius: 10, height: 100, sides: 3, width: 100, x: 0, y: 0 };

describe('drawRoundedPolygon', () => {
  it('should draw a filled triangle fan when fill is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRoundedPolygon(gl, program, buffer, { ...TRIANGLE, fill: '#ffffff' }, 100, 100, IDENTITY_VIEWPORT, false, false, 0);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
  });

  it('should draw an outline when stroke is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRoundedPolygon(gl, program, buffer, { ...TRIANGLE, stroke: '#ffffff' }, 100, 100, IDENTITY_VIEWPORT, false, false, 0);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, expect.any(Number));
  });

  it('should draw nothing when neither fill nor stroke is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRoundedPolygon(gl, program, buffer, TRIANGLE, 100, 100, IDENTITY_VIEWPORT, false, false, 0);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should upload the viewport transform and resolution as uniforms', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRoundedPolygon(gl, program, buffer, { ...TRIANGLE, fill: '#ffffff' }, 100, 200, { x: 5, y: 15, zoom: 2 }, false, false, 0);

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 5, 15);
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 2);
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 100, 200);
  });

  it('should rotate every point around the shape center when rotation is given', () => {
    // mock — a square (sides=4) so the un-rotated top vertex sits at a predictable (50, 0)
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — rotating 90deg around the center (50, 50) swings the top vertex (50, 0) to (100, 50)
    drawRoundedPolygon(
      gl,
      program,
      buffer,
      { cornerRadius: 0, fill: '#ffffff', height: 100, sides: 4, width: 100, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      90,
    );

    // result — vertices[0,1] is the fan center; vertices[2,3] is the first rotated geometry point
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[2]).toBeCloseTo(100);
    expect(vertices[3]).toBeCloseTo(50);
  });

  it('should mirror the fan points around the center when flipX/flipY are given', () => {
    // mock — a square (sides=4) so the un-rotated top vertex sits at a predictable (50, 0)
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — flipping both axes around the center (50, 50) swings the top vertex (50, 0) to (50, 100)
    drawRoundedPolygon(
      gl,
      program,
      buffer,
      { cornerRadius: 0, fill: '#ffffff', height: 100, sides: 4, width: 100, x: 0, y: 0 },
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

    expect(vertices[2]).toBeCloseTo(50);
    expect(vertices[3]).toBeCloseTo(100);
  });
});
