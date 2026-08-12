// utils
import { drawImage } from '../drawImage';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    FLOAT: 5126,
    STATIC_DRAW: 35044,
    TEXTURE0: 33984,
    TEXTURE_2D: 3553,
    TRIANGLES: 4,
    activeTexture: vi.fn(),
    bindBuffer: vi.fn(),
    bindTexture: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawImage', () => {
  it('should draw a textured quad when a texture is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;

    // before
    drawImage(gl, program, buffer, texture, { height: 20, width: 10, x: 0, y: 0 }, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, texture);
    expect(gl.activeTexture).toHaveBeenCalledWith(gl.TEXTURE0);
  });

  it('should draw nothing when no texture is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawImage(gl, program, buffer, null, { height: 20, width: 10, x: 0, y: 0 }, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should upload the viewport transform and resolution as uniforms', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;

    // before
    drawImage(gl, program, buffer, texture, { height: 20, width: 10, x: 0, y: 0 }, 100, 200, { x: 5, y: 15, zoom: 2 });

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 5, 15);
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 2);
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 100, 200);
  });

  it('should upload interleaved position/texCoord vertices covering the rect', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;

    // before
    drawImage(gl, program, buffer, texture, { height: 20, width: 10, x: 5, y: 5 }, 100, 100, IDENTITY_VIEWPORT);

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    // first vertex: position (5, 5), texCoord (0, 0)
    expect(Array.from(vertices.slice(0, 4))).toEqual([5, 5, 0, 0]);
    // third vertex: position (15, 25), texCoord (1, 1)
    expect(Array.from(vertices.slice(8, 12))).toEqual([15, 25, 1, 1]);
  });
});
