// utils
import { drawVectorImageFill } from '../drawVectorImageFill';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ALWAYS: 519,
    ARRAY_BUFFER: 34962,
    FLOAT: 5126,
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

describe('drawVectorImageFill', () => {
  it('should skip every GL call when there are no faces to fill', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(gl, program, buffer, null, null, [], texture, { height: 40, width: 40 }, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.clear).not.toHaveBeenCalled();
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should skip every GL call when no texture has been loaded yet', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(gl, program, buffer, null, null, faces, null, undefined, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.clear).not.toHaveBeenCalled();
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should bind the resolved texture to texture unit 0', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(gl, program, buffer, null, null, faces, texture, { height: 40, width: 40 }, 100, 100, IDENTITY_VIEWPORT, false);

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
    drawVectorImageFill(gl, program, buffer, null, null, faces, texture, { height: 40, width: 40 }, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.enable).toHaveBeenCalledWith(gl.STENCIL_TEST);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(1, gl.TRIANGLE_FAN, 0, 4);
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(2, gl.TRIANGLES, 0, 6);
    expect(gl.disable).toHaveBeenCalledWith(gl.STENCIL_TEST);
  });

  it('should crop the covering quad UVs to the bounds-relative aspect ratio when the image is wider than the shape', () => {
    // mock — 40x40 (1:1) bounds, 80x40 (2:1) image: only the centered horizontal 50% band of the image is used
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(gl, program, buffer, null, null, faces, texture, { height: 40, width: 80 }, 100, 100, IDENTITY_VIEWPORT, false);

    // result — call 0 is the stencil-mask face upload, call 1 is the covering quad (position + UV interleaved)
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    expect(Array.from(uploadedVertices.slice(2, 4))).toEqual([0.25, 0]);
    expect(Array.from(uploadedVertices.slice(6, 8))).toEqual([0.75, 0]);
  });

  it('should fall back to the full 0..1 UV range when the image size has not loaded yet', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(gl, program, buffer, null, null, faces, texture, undefined, 100, 100, IDENTITY_VIEWPORT, false);

    // result — call 0 is the stencil-mask face upload, call 1 is the covering quad (position + UV interleaved)
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    expect(Array.from(uploadedVertices.slice(2, 4))).toEqual([0, 0]);
    expect(Array.from(uploadedVertices.slice(6, 8))).toEqual([1, 0]);
  });

  it('should rotate the sampled UVs by 90° instead of the quad geometry, for a square image needing no crop', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(gl, program, buffer, null, null, faces, texture, { height: 40, width: 40 }, 100, 100, IDENTITY_VIEWPORT, false, 1, 90);

    // result — call 0 is the stencil-mask face upload, call 1 is the covering quad (position + UV interleaved)
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    // the on-screen quad's corners stay put; only which part of the texture each corner samples rotates
    expect(Array.from(uploadedVertices.slice(0, 2))).toEqual([0, 0]);
    expect(Array.from(uploadedVertices.slice(2, 4))).toEqual([0, 1]);
    expect(Array.from(uploadedVertices.slice(4, 6))).toEqual([40, 0]);
    expect(Array.from(uploadedVertices.slice(6, 8))).toEqual([0, 0]);
  });

  it('should swap the effective image width/height for the cover-fit crop once rotated 90°', () => {
    // mock — 40x40 (1:1) bounds, a physically 80x40 (2:1) image rotated 90° behaves like a 40x80 (0.5:1) source
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(gl, program, buffer, null, null, faces, texture, { height: 40, width: 80 }, 100, 100, IDENTITY_VIEWPORT, false, 1, 90);

    // result — call 0 is the stencil-mask face upload, call 1 is the covering quad (position + UV interleaved)
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    expect(Array.from(uploadedVertices.slice(2, 4))).toEqual([0.25, 1]);
    expect(Array.from(uploadedVertices.slice(6, 8))).toEqual([0.25, 0]);
  });

  it('should default to fully opaque when no alpha is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const opacityLocation = { tag: 'opacity' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_opacity' ? opacityLocation : {},
    );

    // before
    drawVectorImageFill(gl, program, buffer, null, null, faces, texture, { height: 40, width: 40 }, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(opacityLocation, 1);
  });

  it('should upload the given alpha as the opacity uniform', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const opacityLocation = { tag: 'opacity' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_opacity' ? opacityLocation : {},
    );

    // before
    drawVectorImageFill(
      gl,
      program,
      buffer,
      null,
      null,
      faces,
      texture,
      { height: 40, width: 40 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      0.4,
    );

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(opacityLocation, 0.4);
  });
});
