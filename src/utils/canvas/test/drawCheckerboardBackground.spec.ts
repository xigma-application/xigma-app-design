// others
import { CHECKERBOARD_COLOR_A, CHECKERBOARD_COLOR_B, CHECKERBOARD_SQUARE_SIZE_PX } from 'constant/canvas';

// types
import { TViewport } from 'types/design/types';

// utils
import { drawCheckerboardBackground } from '../drawCheckerboardBackground';
import { hexToRgbaFloat } from '../hexToRgbaFloat';
import { hexToRgbFloat } from '../hexToRgbFloat';

const VIEWPORT: TViewport = { x: 40, y: -20, zoom: 2 };
const PAINT_COLOR = '#336699';
const PAINT_MIX = 0.5;

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    FLOAT: 5126,
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
    uniform3fv: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('drawCheckerboardBackground', () => {
  it('should draw a full-viewport quad', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCheckerboardBackground(gl, program, buffer, 300, 200, VIEWPORT, PAINT_COLOR, PAINT_MIX);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should pass the resolution through unchanged, for the fragment shader to compute screen position', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCheckerboardBackground(gl, program, buffer, 300, 200, VIEWPORT, PAINT_COLOR, PAINT_MIX);

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 300, 200);
  });

  it('should color the two checkerboard squares with CHECKERBOARD_COLOR_A/B', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCheckerboardBackground(gl, program, buffer, 300, 200, VIEWPORT, PAINT_COLOR, PAINT_MIX);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), hexToRgbaFloat(CHECKERBOARD_COLOR_A));
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), hexToRgbaFloat(CHECKERBOARD_COLOR_B));
  });

  it('should size the squares by CHECKERBOARD_SQUARE_SIZE_PX', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCheckerboardBackground(gl, program, buffer, 300, 200, VIEWPORT, PAINT_COLOR, PAINT_MIX);

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), CHECKERBOARD_SQUARE_SIZE_PX);
  });

  it('should pass the viewport offset and zoom through, so the pattern is anchored to world space and pans/zooms with the canvas', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCheckerboardBackground(gl, program, buffer, 300, 200, VIEWPORT, PAINT_COLOR, PAINT_MIX);

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), VIEWPORT.x, VIEWPORT.y);
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), VIEWPORT.zoom);
  });

  it('should pass the paint color and mix factor through, so the fragment shader can blend the checkerboard toward it', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCheckerboardBackground(gl, program, buffer, 300, 200, VIEWPORT, PAINT_COLOR, PAINT_MIX);

    // result
    expect(gl.uniform3fv).toHaveBeenCalledWith(expect.anything(), hexToRgbFloat(PAINT_COLOR));
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), PAINT_MIX);
  });
});
