// utils
import { drawSliceDraft } from '../drawSliceDraft';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINES: 1,
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

describe('drawSliceDraft', () => {
  it('should draw nothing when no slice rect is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSliceDraft(gl, program, buffer, null, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw the outline stroke and 4 filled corner handles when a slice rect is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSliceDraft(gl, program, buffer, { height: 20, rotation: 0, width: 10, x: 0, y: 0 }, 100, 100, IDENTITY_VIEWPORT);

    // result — 1 outline stroke + 4 corner handle strokes = 5 LINE_LOOP draws, plus 4 corner handle fills
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);
    const triangleDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);

    expect(lineLoopDraws).toHaveLength(5);
    expect(triangleDraws).toHaveLength(4);
    expect(gl.drawArrays).not.toHaveBeenCalledWith(gl.LINES, expect.anything(), expect.anything());
  });

  it('should also draw a dashed bounding-box outline when the slice rect is rotated', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSliceDraft(gl, program, buffer, { height: 20, rotation: 45, width: 10, x: 0, y: 0 }, 100, 100, IDENTITY_VIEWPORT);

    // result — the dashed outline is drawn with individual LINES segments, unlike the solid LINE_LOOP outline
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, expect.any(Number));
  });
});
