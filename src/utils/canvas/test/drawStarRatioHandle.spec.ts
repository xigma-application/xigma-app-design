// others
import { RADIUS_HANDLE_SIZE } from 'constant/canvas';

// utils
import { drawStarRatioHandle } from '../drawStarRatioHandle';

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
const STAR_BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('drawStarRatioHandle', () => {
  it('should draw a fill and a stroke pass for the single handle', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStarRatioHandle(gl, program, buffer, STAR_BOUNDS, 5, 0.5, 0, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, expect.any(Number));
  });

  it('should size the handle using RADIUS_HANDLE_SIZE', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStarRatioHandle(gl, program, buffer, STAR_BOUNDS, 5, 0.5, 0, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];
    const worldWidth = Math.abs(vertices[2] - vertices[0]) * 2;

    expect(worldWidth).toBeCloseTo(RADIUS_HANDLE_SIZE);
  });

  it('should position the handle on the star vertex index 1', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — vertex index 1 of a 100x100 5-point star sits at (64.694631, 29.774575)
    drawStarRatioHandle(gl, program, buffer, STAR_BOUNDS, 5, 0.5, 0, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result — the handle fill is the first draw call; its fan center is the handle's own position
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[0]).toBeCloseTo(64.694631, 4);
    expect(vertices[1]).toBeCloseTo(29.774575, 4);
  });

  it('should rotate the handle position around the bounds center when rotation is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStarRatioHandle(gl, program, buffer, STAR_BOUNDS, 5, 0.5, 0, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 90);

    // result — the handle (64.694631, 29.774575) rotated 90deg around the center (50, 50) swings to (70.225425, 64.694631)
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[0]).toBeCloseTo(70.225425, 4);
    expect(vertices[1]).toBeCloseTo(64.694631, 4);
  });

  it('should flip the handle position when flipX/flipY are set', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — vertex index 1 (64.694631, 29.774575) mirrored across center (50, 50) is (35.305369, 70.225425)
    drawStarRatioHandle(gl, program, buffer, STAR_BOUNDS, 5, 0.5, 0, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0, true, true);

    // result
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[0]).toBeCloseTo(35.305369, 4);
    expect(vertices[1]).toBeCloseTo(70.225425, 4);
  });
});
