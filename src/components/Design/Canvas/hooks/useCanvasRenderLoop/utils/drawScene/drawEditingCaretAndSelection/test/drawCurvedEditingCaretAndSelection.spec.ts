// utils
import { drawCurvedEditingCaretAndSelection } from '../drawCurvedEditingCaretAndSelection';

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

const BLINK_ON_TIME = 0;
const BLINK_OFF_TIME = 530;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('drawCurvedEditingCaretAndSelection', () => {
  it('should draw a single curved caret rect for a collapsed selection while blinked on', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    vi.spyOn(Date, 'now').mockReturnValue(BLINK_ON_TIME);

    // before
    drawCurvedEditingCaretAndSelection(gl, program, buffer, PATH_BOX, 'hi', 2, 2, 0, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should draw nothing for a collapsed selection while the caret is blinked off', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    vi.spyOn(Date, 'now').mockReturnValue(BLINK_OFF_TIME);

    // before
    drawCurvedEditingCaretAndSelection(gl, program, buffer, PATH_BOX, 'hi', 2, 2, 0, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw one filled rect per selected character for a range selection', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    vi.spyOn(Date, 'now').mockReturnValue(BLINK_OFF_TIME);

    // before
    drawCurvedEditingCaretAndSelection(gl, program, buffer, PATH_BOX, 'hello', 0, 3, 0, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(3);
  });
});
