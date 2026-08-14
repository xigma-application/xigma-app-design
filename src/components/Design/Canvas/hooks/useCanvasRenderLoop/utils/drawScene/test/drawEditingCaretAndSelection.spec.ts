// others
import { CARET_BLINK_INTERVAL_MS } from 'constant/canvas';
import { TEXT_FILL } from '../../../../../constants';

// utils
import { drawEditingCaretAndSelection } from '../drawEditingCaretAndSelection';
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
const AXIS_ALIGNED_BOX = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 0, y: 0 };

const BLINK_ON_TIME = 0;
const BLINK_OFF_TIME = 530;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('drawEditingCaretAndSelection', () => {
  it('should draw nothing for a collapsed selection while the caret is blinked off', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    vi.spyOn(Date, 'now').mockReturnValue(BLINK_OFF_TIME);

    // before
    drawEditingCaretAndSelection(gl, program, buffer, AXIS_ALIGNED_BOX, 'hello', 3, 3, 0, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw a single filled caret rect for a collapsed selection while the caret is blinked on', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    vi.spyOn(Date, 'now').mockReturnValue(BLINK_ON_TIME);

    // before
    drawEditingCaretAndSelection(gl, program, buffer, AXIS_ALIGNED_BOX, 'hello', 3, 3, 0, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should draw one filled rect per selected line for a range selection, regardless of blink phase', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    vi.spyOn(Date, 'now').mockReturnValue(BLINK_OFF_TIME);

    // before — "hello world" on one unwrapped line, selecting offsets 0-5 ("hello")
    drawEditingCaretAndSelection(gl, program, buffer, AXIS_ALIGNED_BOX, 'hello world', 0, 5, 0, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it("should rotate the caret around the editing box's own center, not the caret rect's own center", () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const rotatedBox = { flipX: false, flipY: false, height: 20, rotation: 90, width: 100, x: 0, y: 0 };

    vi.spyOn(Date, 'now').mockReturnValue(BLINK_ON_TIME);

    // before — empty content, caret at offset 0 sits at the box's local origin (0, 0)
    drawEditingCaretAndSelection(gl, program, buffer, rotatedBox, '', 0, 0, 0, 100, 100, IDENTITY_VIEWPORT);

    // result — a 90deg rotation around the box's center (50, 10), not the caret's own tiny center,
    const [caretCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = caretCall[1];

    expect(vertices[0]).toBeCloseTo(60);
    expect(vertices[1]).toBeCloseTo(-40.75);
  });

  it('should color the caret the same as the glyph text fill, not the selection-highlight blue', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    vi.spyOn(Date, 'now').mockReturnValue(BLINK_ON_TIME);

    // before
    drawEditingCaretAndSelection(gl, program, buffer, AXIS_ALIGNED_BOX, 'hello', 3, 3, 0, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), hexToRgbaFloat(TEXT_FILL));
  });

  it('should stay solid, not blinking, for a full interval right after the selection last changed', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const changedAt = 1_000_000;

    vi.spyOn(Date, 'now').mockReturnValue(changedAt + 100);

    // before
    drawEditingCaretAndSelection(gl, program, buffer, AXIS_ALIGNED_BOX, 'hello', 3, 3, changedAt, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should resume blinking once the selection has sat still for a full interval', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const changedAt = 1_000_000;

    vi.spyOn(Date, 'now').mockReturnValue(changedAt + CARET_BLINK_INTERVAL_MS);

    // before
    drawEditingCaretAndSelection(gl, program, buffer, AXIS_ALIGNED_BOX, 'hello', 3, 3, changedAt, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
