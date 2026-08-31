// utils
import { drawFilledQuad } from '../drawFilledQuad';
import { hexToRgbaFloat } from '../hexToRgbaFloat';

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

const CORNERS: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];
const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawFilledQuad', () => {
  it('should upload the two triangles making up the quad and draw them in one call', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawFilledQuad(gl, program, buffer, CORNERS, '#ff0000', 100, 100, IDENTITY_VIEWPORT);

    // result — corner order c1,c2,c3, c1,c3,c4
    expect(gl.bufferData).toHaveBeenCalledWith(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 10, 0, 10, 10, 0, 0, 10, 10, 0, 10]),
      gl.STATIC_DRAW,
    );
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should use the given fill color', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawFilledQuad(gl, program, buffer, CORNERS, '#00ff00', 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), hexToRgbaFloat('#00ff00'));
  });
});
