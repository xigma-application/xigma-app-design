// utils
import { drawImageEditorImageOutline } from '../drawImageEditorImageOutline';

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

const crop = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };

describe('drawImageEditorImageOutline', () => {
  it('should draw only a plain stroked outline when inactive, no corner handles', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawImageEditorImageOutline(gl, program, buffer, crop, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);

    expect(lineLoopDraws).toHaveLength(1);
    expect(trianglesDraws).toHaveLength(0);
  });

  it('should additionally draw 4 corner handles when active', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawImageEditorImageOutline(gl, program, buffer, crop, 100, 100, IDENTITY_VIEWPORT, true);

    // result — outline + 4 handle strokes = 5 LINE_LOOP, plus 4 handle fills = 4 TRIANGLES
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);

    expect(lineLoopDraws).toHaveLength(5);
    expect(trianglesDraws).toHaveLength(4);
  });
});
