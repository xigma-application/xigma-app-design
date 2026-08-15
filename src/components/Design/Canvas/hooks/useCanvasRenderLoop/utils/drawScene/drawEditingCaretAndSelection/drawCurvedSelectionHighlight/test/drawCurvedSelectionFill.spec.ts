// others
import { DRAFT_FRAME_STROKE, TEXT_SELECTION_FILL_ALPHA } from 'constant/canvas';

// utils
import { drawCurvedSelectionFill } from '../drawCurvedSelectionFill';
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
const VERTICES = [0, 0, 10, 0, 10, 10, 0, 0, 10, 10, 0, 10];

describe('drawCurvedSelectionFill', () => {
  it('should draw the given vertices as a single triangles pass', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedSelectionFill(gl, program, buffer, VERTICES, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, VERTICES.length / 2);
  });

  it('should fill with the draft-frame stroke color at the selection alpha', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedSelectionFill(gl, program, buffer, VERTICES, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), hexToRgbaFloat(DRAFT_FRAME_STROKE, TEXT_SELECTION_FILL_ALPHA));
  });

  it('should upload the exact vertices it was given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedSelectionFill(gl, program, buffer, VERTICES, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.bufferData).toHaveBeenCalledWith(gl.ARRAY_BUFFER, new Float32Array(VERTICES), gl.STATIC_DRAW);
  });
});
