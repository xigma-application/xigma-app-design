// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// utils
import { drawCurvedSelectionOutline } from '../drawCurvedSelectionOutline';
import { hexToRgbaFloat } from 'utils/canvas/hexToRgbaFloat';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    LINES: 1,
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
const POINTS = [0, 0, 10, 0, 10, 10, 0, 10];

describe('drawCurvedSelectionOutline', () => {
  it('should stroke the given points as disconnected line segments, not a closed loop', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedSelectionOutline(gl, program, buffer, POINTS, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, POINTS.length / 2);
  });

  it('should stroke with the draft-frame stroke color at full opacity, unlike the semi-transparent fill', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedSelectionOutline(gl, program, buffer, POINTS, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), hexToRgbaFloat(DRAFT_FRAME_STROKE));
  });

  it('should upload the exact points it was given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedSelectionOutline(gl, program, buffer, POINTS, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.bufferData).toHaveBeenCalledWith(gl.ARRAY_BUFFER, new Float32Array(POINTS), gl.STATIC_DRAW);
  });
});
