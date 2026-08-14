// others
import { DRAFT_FRAME_STROKE, TEXT_SELECTION_FILL_ALPHA } from 'constant/canvas';

// utils
import { drawStraightSelectionHighlight } from '../drawStraightSelectionHighlight';
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

describe('drawStraightSelectionHighlight', () => {
  it('should draw one filled rect per selected line, on one unwrapped line', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — "hello world" on one unwrapped line, selecting offsets 0-5 ("hello")
    drawStraightSelectionHighlight(gl, program, buffer, AXIS_ALIGNED_BOX, 'hello world', 0, 5, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should fill the rect with the draft-frame stroke color at the selection alpha', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStraightSelectionHighlight(gl, program, buffer, AXIS_ALIGNED_BOX, 'hello', 0, 3, 100, 100, IDENTITY_VIEWPORT);

    // result
    const [, colorArgument] = (gl.uniform4fv as ReturnType<typeof vi.fn>).mock.calls[0];

    expect(colorArgument).toEqual(hexToRgbaFloat(DRAFT_FRAME_STROKE, TEXT_SELECTION_FILL_ALPHA));
  });

  it('should draw nothing when the selection is empty', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStraightSelectionHighlight(gl, program, buffer, AXIS_ALIGNED_BOX, 'hello', 3, 3, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
