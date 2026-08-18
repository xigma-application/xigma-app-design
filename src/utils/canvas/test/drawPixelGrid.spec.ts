// others
import { GRID_COLOR, GRID_MIN_ZOOM } from 'constant/canvas';

// utils
import { drawPixelGrid } from '../drawPixelGrid';
import { hexToRgbaFloat } from '../hexToRgbaFloat';

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
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('drawPixelGrid', () => {
  it('should draw nothing below the minimum zoom threshold', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawPixelGrid(gl, program, buffer, 100, 100, { x: 0, y: 0, zoom: GRID_MIN_ZOOM - 0.01 });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw a full-viewport quad once the zoom reaches the minimum threshold', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawPixelGrid(gl, program, buffer, 100, 100, { x: 0, y: 0, zoom: GRID_MIN_ZOOM });

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should keep drawing above the minimum zoom threshold too', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawPixelGrid(gl, program, buffer, 100, 100, { x: 0, y: 0, zoom: GRID_MIN_ZOOM * 10 });

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should pass the pan/zoom/resolution uniforms through unchanged, for the fragment shader to reconstruct world position', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawPixelGrid(gl, program, buffer, 300, 200, { x: 12, y: 34, zoom: GRID_MIN_ZOOM });

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 12, 34);
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), GRID_MIN_ZOOM);
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 300, 200);
  });

  it('should color the grid with GRID_COLOR', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawPixelGrid(gl, program, buffer, 100, 100, { x: 0, y: 0, zoom: GRID_MIN_ZOOM });

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), hexToRgbaFloat(GRID_COLOR));
  });
});
