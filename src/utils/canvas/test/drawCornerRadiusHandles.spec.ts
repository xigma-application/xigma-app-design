// others
import { RADIUS_HANDLE_SIZE } from 'constant/canvas';

// utils
import { drawCornerRadiusHandles } from '../drawCornerRadiusHandles';

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

describe('drawCornerRadiusHandles', () => {
  it('should draw a fill and a stroke pass for each of the 4 corners', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerRadiusHandles(gl, program, buffer, { height: 100, width: 100, x: 0, y: 0 }, 15, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(8);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, expect.any(Number));
  });

  it('should size each handle using RADIUS_HANDLE_SIZE', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerRadiusHandles(gl, program, buffer, { height: 100, width: 100, x: 0, y: 0 }, 15, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];
    const worldWidth = Math.abs(vertices[2] - vertices[0]) * 2;

    expect(worldWidth).toBeCloseTo(RADIUS_HANDLE_SIZE);
  });

  it('should position each handle inset by the corner radius', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerRadiusHandles(gl, program, buffer, { height: 100, width: 100, x: 0, y: 0 }, 15, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result — the ne handle fill is the first draw call; its fan center is the handle's own position
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[0]).toBeCloseTo(85);
    expect(vertices[1]).toBeCloseTo(15);
  });

  it('should draw the handle exactly on the corner at radius 0 when isDragging is true, instead of the zero-state offset', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerRadiusHandles(
      gl,
      program,
      buffer,
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      '#0d99ff',
      100,
      100,
      IDENTITY_VIEWPORT,
      0,
      true,
    );

    // result — the ne handle fill is the first draw call; its fan center sits right on the corner (100, 0)
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[0]).toBeCloseTo(100);
    expect(vertices[1]).toBeCloseTo(0);
  });

  it('should rotate each handle position around the rect center when rotation is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerRadiusHandles(gl, program, buffer, { height: 100, width: 100, x: 0, y: 0 }, 15, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 90);

    // result — the ne handle (85, 15) rotated 90deg around the center (50, 50) swings to (85, 85)
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[0]).toBeCloseTo(85);
    expect(vertices[1]).toBeCloseTo(85);
  });
});
