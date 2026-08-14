// others
import { TEXT_FILL } from '../../../../../../constants';

// utils
import { drawCurvedCaret } from '../drawCurvedCaret';
import { hexToRgbaFloat } from 'utils/canvas/hexToRgbaFloat';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
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
const PATH_BOX = { flipX: false, flipY: false, height: 200, pathId: 'ellipse-1', rotation: 0, width: 200, x: 0, y: 0 };

describe('drawCurvedCaret', () => {
  it('should draw a single filled caret rect', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedCaret(gl, program, buffer, PATH_BOX, 'hi', 0, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should color the caret the same as the glyph text fill, not the selection-highlight blue', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedCaret(gl, program, buffer, PATH_BOX, 'hi', 0, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), hexToRgbaFloat(TEXT_FILL));
  });

  it('should move the caret when the caret index changes', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedCaret(gl, program, buffer, PATH_BOX, 'hi', 0, 100, 100, IDENTITY_VIEWPORT);

    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    (gl.bufferData as ReturnType<typeof vi.fn>).mockClear();
    drawCurvedCaret(gl, program, buffer, PATH_BOX, 'hi', 2, 100, 100, IDENTITY_VIEWPORT);

    const [secondCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    // result
    expect(secondCall[1]).not.toEqual(firstCall[1]);
  });
});
