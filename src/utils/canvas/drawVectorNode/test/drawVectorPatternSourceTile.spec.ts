// utils
import { drawVectorPatternSourceTile } from '../drawVectorPatternSourceTile';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ALWAYS: 519,
    INVERT: 5386,
    KEEP: 7680,
    NOTEQUAL: 517,
    STATIC_DRAW: 35044,
    STENCIL_BUFFER_BIT: 1024,
    STENCIL_TEST: 2960,
    TEXTURE0: 33984,
    TEXTURE_2D: 3553,
    TRIANGLES: 4,
    TRIANGLE_FAN: 6,
    activeTexture: vi.fn(),
    bindBuffer: vi.fn(),
    bindTexture: vi.fn(),
    bufferData: vi.fn(),
    clear: vi.fn(),
    colorMask: vi.fn(),
    disable: vi.fn(),
    drawArrays: vi.fn(),
    enable: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    stencilFunc: vi.fn(),
    stencilOp: vi.fn(),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const faces = [
  [
    { x: 0, y: 0 },
    { x: 40, y: 0 },
    { x: 40, y: 40 },
    { x: 0, y: 40 },
  ],
];
const texture = {} as WebGLTexture;
const sourceTile = { height: 10, texture, width: 10, x: 0, y: 0 };

describe('drawVectorPatternSourceTile', () => {
  it('should skip every GL call when there are no faces to fill', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorPatternSourceTile(gl, program, buffer, null, null, [], sourceTile, 100, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.clear).not.toHaveBeenCalled();
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should bind the resolved source texture to texture unit 0', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorPatternSourceTile(gl, program, buffer, null, null, faces, sourceTile, 100, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.activeTexture).toHaveBeenCalledWith(gl.TEXTURE0);
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, texture);
  });

  it('should run the even-odd stencil pass then a single covering-quad composite draw call', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorPatternSourceTile(gl, program, buffer, null, null, faces, sourceTile, 100, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.enable).toHaveBeenCalledWith(gl.STENCIL_TEST);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(1, gl.TRIANGLE_FAN, 0, 4);
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(2, gl.TRIANGLES, 0, 6);
    expect(gl.disable).toHaveBeenCalledWith(gl.STENCIL_TEST);
  });

  it('should size the tile count from the bounds relative to the source size scaled by the given percentage', () => {
    // mock — 40x40 bounds, 10x10 tile at 100% scale = 4 tiles across each axis
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const tileCountLocation = { tag: 'tileCount' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_tileCount' ? tileCountLocation : {},
    );

    // before
    drawVectorPatternSourceTile(gl, program, buffer, null, null, faces, sourceTile, 100, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(tileCountLocation, 4, 4);
  });

  it('should shrink the tile count when the scale percentage grows the tile size', () => {
    // mock — 40x40 bounds, 10x10 tile at 200% scale (20x20 effective) = 2 tiles across each axis
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const tileCountLocation = { tag: 'tileCount' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_tileCount' ? tileCountLocation : {},
    );

    // before
    drawVectorPatternSourceTile(gl, program, buffer, null, null, faces, sourceTile, 200, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(tileCountLocation, 2, 2);
  });

  it('should composite at the given opacity', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const opacityLocation = { tag: 'opacity' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_opacity' ? opacityLocation : {},
    );

    // before
    drawVectorPatternSourceTile(gl, program, buffer, null, null, faces, sourceTile, 100, 100, 100, IDENTITY_VIEWPORT, false, 0.5);

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(opacityLocation, 0.5);
  });
});
