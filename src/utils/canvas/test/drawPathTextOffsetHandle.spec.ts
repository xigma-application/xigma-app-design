// others
import { CORNER_HANDLE_SIZE, ELLIPSE_SEGMENTS } from 'constant/canvas';

// utils
import { drawPathTextOffsetHandle } from '../drawPathTextOffsetHandle';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
    TRIANGLE_FAN: 6,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
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

describe('drawPathTextOffsetHandle', () => {
  it('should draw a filled, stroked circle at the given point', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawPathTextOffsetHandle(gl, program, buffer, { x: 50, y: 50 }, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, ELLIPSE_SEGMENTS + 2);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, ELLIPSE_SEGMENTS);
  });

  it('should keep the handle a constant size on screen regardless of zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawPathTextOffsetHandle(gl, program, buffer, { x: 50, y: 50 }, '#0d99ff', 100, 100, { x: 0, y: 0, zoom: 4 });

    // result
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];
    const xs = Array.from({ length: (vertices.length - 2) / 2 }, (_, index) => vertices[2 + index * 2]);
    const worldWidth = Math.max(...xs) - Math.min(...xs);

    expect(worldWidth).toBeCloseTo(CORNER_HANDLE_SIZE / 4);
  });
});
