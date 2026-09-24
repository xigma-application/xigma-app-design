// utils
import { drawLineBatch } from '../drawLineBatch';

const createGl = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 1,
    FLOAT: 5,
    STATIC_DRAW: 2,
    TRIANGLES: 4,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn((_, name: string) => name),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const VIEWPORT = { x: 5, y: 6, zoom: 2 };
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawLineBatch', () => {
  it('should draw every non-degenerate line as one quad in a single call', () => {
    // mock
    const gl = createGl();

    // before
    drawLineBatch(
      gl,
      program,
      buffer,
      [
        { x1: 0, x2: 10, y1: 0, y2: 0 },
        { x1: 5, x2: 5, y1: 5, y2: 5 },
        { x1: 0, x2: 0, y1: 0, y2: 10 },
      ],
      '#ff0000',
      2,
      200,
      100,
      VIEWPORT,
      0.5,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(4, 0, 12);
    expect(gl.uniform4fv).toHaveBeenCalledWith('u_color', [1, 0, 0, 0.5]);
    expect(gl.uniform2f).toHaveBeenCalledWith('u_viewportOffset', 5, 6);
    expect(gl.uniform1f).toHaveBeenCalledWith('u_zoom', 2);
    expect(gl.uniform2f).toHaveBeenCalledWith('u_resolution', 200, 100);
  });

  it('should offset a horizontal line by half the stroke width on both sides', () => {
    // mock
    const gl = createGl();

    // before
    drawLineBatch(gl, program, buffer, [{ x1: 0, x2: 10, y1: 0, y2: 0 }], '#000000', 2, 200, 100, VIEWPORT);

    // result
    const uploaded = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0][1] as Float32Array;

    expect(Array.from(uploaded)).toEqual([-0, 1, 10, 1, 10, -1, -0, 1, 10, -1, -0, -1].map((value) => (Object.is(value, -0) ? 0 : value)));
  });

  it('should draw nothing when every line is degenerate or the list is empty', () => {
    // mock
    const gl = createGl();

    // before
    drawLineBatch(gl, program, buffer, [], '#000000', 1, 100, 100, VIEWPORT);
    drawLineBatch(gl, program, buffer, [{ x1: 1, x2: 1, y1: 1, y2: 1 }], '#000000', 1, 100, 100, VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
    expect(gl.bufferData).not.toHaveBeenCalled();
  });
});
