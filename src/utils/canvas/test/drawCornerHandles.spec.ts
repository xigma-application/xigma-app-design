// others
import { CORNER_HANDLE_SIZE } from 'constant/canvas';

// utils
import { drawCornerHandles } from '../drawCornerHandles';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
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

describe('drawCornerHandles', () => {
  it('should draw a fill and a stroke pass for each of the 4 corners', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerHandles(gl, program, buffer, { height: 20, width: 10, x: 0, y: 0 }, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(8);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, 4);
  });

  it('should size each handle using CORNER_HANDLE_SIZE', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerHandles(gl, program, buffer, { height: 20, width: 10, x: 0, y: 0 }, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result
    const bufferDataCalls = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const [firstFillCall] = bufferDataCalls;
    const vertices: Float32Array = firstFillCall[1];
    const worldWidth = Math.abs(vertices[2] - vertices[0]);

    expect(worldWidth).toBeCloseTo(CORNER_HANDLE_SIZE);
  });

  it('should keep the handle a constant size on screen regardless of zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerHandles(gl, program, buffer, { height: 20, width: 10, x: 0, y: 0 }, '#0d99ff', 100, 100, {
      x: 0,
      y: 0,
      zoom: 4,
    });

    // result
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];
    const worldWidth = Math.abs(vertices[2] - vertices[0]);
    const screenWidth = worldWidth * 4;

    expect(worldWidth).toBeCloseTo(CORNER_HANDLE_SIZE / 4);
    expect(screenWidth).toBeCloseTo(CORNER_HANDLE_SIZE);
  });
});
