// others
import { TEXT_FILL } from '../../../../../../constants';

// utils
import { drawStraightCaret } from '../drawStraightCaret';
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

describe('drawStraightCaret', () => {
  it('should draw a single filled caret rect', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStraightCaret(gl, program, buffer, AXIS_ALIGNED_BOX, 'hello', 3, 100, 100, IDENTITY_VIEWPORT);

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
    drawStraightCaret(gl, program, buffer, AXIS_ALIGNED_BOX, 'hello', 3, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), hexToRgbaFloat(TEXT_FILL));
  });

  it("should rotate the caret around the editing box's own center, not the caret rect's own center", () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const rotatedBox = { flipX: false, flipY: false, height: 20, rotation: 90, width: 100, x: 0, y: 0 };

    // before — empty content, caret at offset 0 sits at the box's local origin (0, 0)
    drawStraightCaret(gl, program, buffer, rotatedBox, '', 0, 100, 100, IDENTITY_VIEWPORT);

    // result — a 90deg rotation around the box's center (50, 10), not the caret's own tiny center
    const [caretCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = caretCall[1];

    expect(vertices[0]).toBeCloseTo(60);
    expect(vertices[1]).toBeCloseTo(-40.75);
  });
});
