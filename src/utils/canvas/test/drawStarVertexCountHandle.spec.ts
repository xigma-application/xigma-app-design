// others
import { RADIUS_HANDLE_SIZE } from 'constant/canvas';

// utils
import { drawStarVertexCountHandle } from '../drawStarVertexCountHandle';

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

describe('drawStarVertexCountHandle', () => {
  it('should draw a fill and a stroke pass for the single handle', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStarVertexCountHandle(gl, program, buffer, STAR_BOUNDS, 5, 0.5, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

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
    drawStarVertexCountHandle(gl, program, buffer, STAR_BOUNDS, 5, 0.5, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];
    const worldWidth = Math.abs(vertices[2] - vertices[0]) * 2;

    expect(worldWidth).toBeCloseTo(RADIUS_HANDLE_SIZE);
  });

  it('should position the handle on the star vertex index 2', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — vertex index 2 of a 100x100 5-point star sits at (97.552826, 34.549150)
    drawStarVertexCountHandle(gl, program, buffer, STAR_BOUNDS, 5, 0.5, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0);

    // result — the handle fill is the first draw call; its fan center is the handle's own position
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[0]).toBeCloseTo(97.552826, 4);
    expect(vertices[1]).toBeCloseTo(34.54915, 4);
  });

  it('should rotate the handle position around the bounds center when rotation is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStarVertexCountHandle(gl, program, buffer, STAR_BOUNDS, 5, 0.5, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 90);

    // result — the handle (97.552826, 34.549150) rotated 90deg around the center (50, 50) swings to (65.450850, 97.552826)
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[0]).toBeCloseTo(65.45085, 4);
    expect(vertices[1]).toBeCloseTo(97.552826, 4);
  });

  it('should flip the handle position when flipX/flipY are set', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — vertex index 2 (97.552826, 34.549150) mirrored across center (50, 50) is (2.447174, 65.450850)
    drawStarVertexCountHandle(gl, program, buffer, STAR_BOUNDS, 5, 0.5, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, 0, true, true);

    // result
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[0]).toBeCloseTo(2.447174, 4);
    expect(vertices[1]).toBeCloseTo(65.45085, 4);
  });
});
