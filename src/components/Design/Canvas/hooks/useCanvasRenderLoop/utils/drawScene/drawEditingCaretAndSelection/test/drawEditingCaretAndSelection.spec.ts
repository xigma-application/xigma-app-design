// utils
import { drawEditingCaretAndSelection } from '../drawEditingCaretAndSelection';

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
const BLINK_ON_TIME = 0;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('drawEditingCaretAndSelection', () => {
  it('should draw straight text as a single unwrapped-line caret for a box without a path binding', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 0, y: 0 };

    vi.spyOn(Date, 'now').mockReturnValue(BLINK_ON_TIME);

    // before
    drawEditingCaretAndSelection(gl, program, buffer, box, 'hello', 3, 3, 0, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
  });

  it('should draw a curved caret for a box attached to a path', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const box = { flipX: false, flipY: false, height: 200, pathId: 'ellipse-1', rotation: 0, width: 200, x: 0, y: 0 };

    vi.spyOn(Date, 'now').mockReturnValue(BLINK_ON_TIME);

    // before
    drawEditingCaretAndSelection(gl, program, buffer, box, 'hi', 2, 2, 0, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
  });
});
