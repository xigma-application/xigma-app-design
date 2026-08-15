// others
import { DRAFT_FRAME_STROKE, TEXT_SELECTION_FILL_ALPHA } from 'constant/canvas';

// utils
import { drawCurvedSelectionHighlight } from '../drawCurvedSelectionHighlight';
import { hexToRgbaFloat } from 'utils/canvas/hexToRgbaFloat';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    LINE_LOOP: 2,
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

describe('drawCurvedSelectionHighlight', () => {
  it('should draw the fill as one continuous ribbon (a single triangles draw call), not one rect per character', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — 3 selected characters -> 3 quads sharing vertices at their boundaries, 6 verts each
    drawCurvedSelectionHighlight(gl, program, buffer, PATH_BOX, 'hello', 0, 3, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 18);
  });

  it('should also stroke a 1px outline around the whole ribbon as a single closed loop', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — 3 selected characters -> 4 boundary points, outline = 4 top + 4 bottom = 8 points
    drawCurvedSelectionHighlight(gl, program, buffer, PATH_BOX, 'hello', 0, 3, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, 8);
  });

  it('should fill the ribbon at the selection alpha, but stroke the outline at full opacity', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedSelectionHighlight(gl, program, buffer, PATH_BOX, 'hi', 0, 2, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledTimes(2);
    expect(gl.uniform4fv).toHaveBeenNthCalledWith(1, expect.anything(), hexToRgbaFloat(DRAFT_FRAME_STROKE, TEXT_SELECTION_FILL_ALPHA));
    expect(gl.uniform4fv).toHaveBeenNthCalledWith(2, expect.anything(), hexToRgbaFloat(DRAFT_FRAME_STROKE));
  });

  it('should draw nothing for a collapsed selection', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedSelectionHighlight(gl, program, buffer, PATH_BOX, 'hello', 2, 2, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it("should follow the path's own rotation instead of always drawing as if unrotated", () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedSelectionHighlight(gl, program, buffer, PATH_BOX, 'hi', 0, 2, 100, 100, IDENTITY_VIEWPORT);

    const [unrotatedCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    (gl.bufferData as ReturnType<typeof vi.fn>).mockClear();
    drawCurvedSelectionHighlight(gl, program, buffer, { ...PATH_BOX, rotation: 180 }, 'hi', 0, 2, 100, 100, IDENTITY_VIEWPORT);

    const [rotatedCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    // result
    expect(rotatedCall[1]).not.toEqual(unrotatedCall[1]);
  });

  it("should follow the path's own horizontal flip instead of always drawing as if unflipped", () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedSelectionHighlight(gl, program, buffer, PATH_BOX, 'hi', 0, 2, 100, 100, IDENTITY_VIEWPORT);

    const [unflippedCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    (gl.bufferData as ReturnType<typeof vi.fn>).mockClear();
    drawCurvedSelectionHighlight(gl, program, buffer, { ...PATH_BOX, flipX: true }, 'hi', 0, 2, 100, 100, IDENTITY_VIEWPORT);

    const [flippedCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    // result
    expect(flippedCall[1]).not.toEqual(unflippedCall[1]);
  });
});
