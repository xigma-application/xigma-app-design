// others
import { IMAGE_EDITOR_CORNER_ARM_LENGTH, IMAGE_EDITOR_HANDLE_THICKNESS } from 'constant/canvas';

// utils
import { drawImageEditorCornerHandles } from '../drawImageEditorCornerHandles';

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

const getVertexExtent = (vertices: Float32Array, offset: 0 | 1): { max: number; min: number } => {
  const values = Array.from(vertices).filter((_, index) => index % 2 === offset && index > 1);

  return { max: Math.max(...values), min: Math.min(...values) };
};

describe('drawImageEditorCornerHandles', () => {
  it('should draw two arms (an L bracket) for each of the 4 corners', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawImageEditorCornerHandles(gl, program, buffer, { height: 40, width: 40, x: 0, y: 0 }, '#0c8ce9', 100, 100, IDENTITY_VIEWPORT, 0);

    // result — 4 corners x 2 arms each
    expect(gl.drawArrays).toHaveBeenCalledTimes(8);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, expect.any(Number));
  });

  it('should size each arm using IMAGE_EDITOR_CORNER_ARM_LENGTH (plus the thickness overlap) and IMAGE_EDITOR_HANDLE_THICKNESS', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — top-left corner's horizontal arm (first draw call) extends rightward, thickness-tall
    drawImageEditorCornerHandles(gl, program, buffer, { height: 40, width: 40, x: 0, y: 0 }, '#0c8ce9', 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];
    const xExtent = getVertexExtent(vertices, 0);
    const yExtent = getVertexExtent(vertices, 1);

    expect(xExtent.max - xExtent.min).toBeCloseTo(IMAGE_EDITOR_CORNER_ARM_LENGTH + IMAGE_EDITOR_HANDLE_THICKNESS);
    expect(yExtent.max - yExtent.min).toBeCloseTo(IMAGE_EDITOR_HANDLE_THICKNESS);
  });

  it('should overlap both arms of the top-left corner in the outward corner square, forming a solid L with no gap', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawImageEditorCornerHandles(gl, program, buffer, { height: 40, width: 40, x: 0, y: 0 }, '#0c8ce9', 100, 100, IDENTITY_VIEWPORT, 0);

    // result — both arms reach the same outward extent (-thickness) on both axes, so their corner squares coincide
    const [horizontalArmCall, verticalArmCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const horizontalArmVertices: Float32Array = horizontalArmCall[1];
    const verticalArmVertices: Float32Array = verticalArmCall[1];
    const horizontalArmX = getVertexExtent(horizontalArmVertices, 0);
    const horizontalArmY = getVertexExtent(horizontalArmVertices, 1);
    const verticalArmX = getVertexExtent(verticalArmVertices, 0);
    const verticalArmY = getVertexExtent(verticalArmVertices, 1);

    expect(horizontalArmY.max).toBeCloseTo(0);
    expect(horizontalArmY.min).toBeCloseTo(-IMAGE_EDITOR_HANDLE_THICKNESS);
    expect(verticalArmX.max).toBeCloseTo(0);
    expect(verticalArmX.min).toBeCloseTo(-IMAGE_EDITOR_HANDLE_THICKNESS);
    // the horizontal arm's leftmost x and the vertical arm's topmost y both reach into the shared corner square
    expect(horizontalArmX.min).toBeCloseTo(-IMAGE_EDITOR_HANDLE_THICKNESS);
    expect(verticalArmY.min).toBeCloseTo(-IMAGE_EDITOR_HANDLE_THICKNESS);
  });

  it('should keep the bracket a constant size on screen regardless of zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawImageEditorCornerHandles(
      gl,
      program,
      buffer,
      { height: 40, width: 40, x: 0, y: 0 },
      '#0c8ce9',
      100,
      100,
      { x: 0, y: 0, zoom: 4 },
      0,
    );

    // result
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];
    const xExtent = getVertexExtent(vertices, 0);
    const worldLength = xExtent.max - xExtent.min;
    const screenLength = (IMAGE_EDITOR_CORNER_ARM_LENGTH + IMAGE_EDITOR_HANDLE_THICKNESS) / 4;

    expect(worldLength).toBeCloseTo(screenLength);
    expect(worldLength * 4).toBeCloseTo(IMAGE_EDITOR_CORNER_ARM_LENGTH + IMAGE_EDITOR_HANDLE_THICKNESS);
  });
});
