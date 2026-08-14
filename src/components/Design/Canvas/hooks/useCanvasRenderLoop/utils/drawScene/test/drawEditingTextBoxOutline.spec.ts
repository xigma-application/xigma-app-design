// utils
import { drawEditingTextBoxOutline } from '../drawEditingTextBoxOutline';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
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

describe('drawEditingTextBoxOutline', () => {
  it('should draw an outline around a straight (non-path) editing box', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 0, y: 0 };

    // before
    drawEditingTextBoxOutline(gl, program, buffer, box, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, 4);
  });

  it('should draw nothing while editing text on a path, since the ellipse already shows it', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const box = { flipX: false, flipY: false, height: 20, pathId: 'path-1', rotation: 0, width: 100, x: 0, y: 0 };

    // before
    drawEditingTextBoxOutline(gl, program, buffer, box, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
