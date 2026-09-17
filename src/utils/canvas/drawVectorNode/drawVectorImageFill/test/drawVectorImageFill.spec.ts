// utils
import { drawVectorImageFill } from '../drawVectorImageFill';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ALWAYS: 519,
    ARRAY_BUFFER: 34962,
    CLAMP_TO_EDGE: 33071,
    FLOAT: 5126,
    INVERT: 5386,
    KEEP: 7680,
    NOTEQUAL: 517,
    REPEAT: 10497,
    STATIC_DRAW: 35044,
    STENCIL_BUFFER_BIT: 1024,
    STENCIL_TEST: 2960,
    TEXTURE0: 33984,
    TEXTURE_2D: 3553,
    TEXTURE_WRAP_S: 10242,
    TEXTURE_WRAP_T: 10243,
    TRIANGLES: 4,
    TRIANGLE_FAN: 6,
    activeTexture: vi.fn(),
    bindBuffer: vi.fn(),
    bindTexture: vi.fn(),
    bufferData: vi.fn(),
    clear: vi.fn(),
    colorMask: vi.fn(),
    disable: vi.fn(),
    disableVertexAttribArray: vi.fn(),
    drawArrays: vi.fn(),
    enable: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    stencilFunc: vi.fn(),
    stencilOp: vi.fn(),
    texParameteri: vi.fn(),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
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
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
      buffer,
      null,
      null,
      [],
      texture,
      { height: 40, width: 40 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
    );

    // result
    expect(gl.clear).not.toHaveBeenCalled();
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw a checkerboard placeholder, not the texture program, when no source has been picked yet', () => {
    // mock
    const gl = createGlMock();
    const program = { tag: 'plain-color' } as unknown as WebGLProgram;
    const imageProgram = { tag: 'image' } as unknown as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(gl, program, imageProgram, buffer, null, null, faces, null, undefined, 100, 100, IDENTITY_VIEWPORT, false);

    // result — stencil mask (1 call) + two alternating-color square batches (2 calls)
    expect(gl.useProgram).toHaveBeenCalledWith(program);
    expect(gl.useProgram).not.toHaveBeenCalledWith(imageProgram);
    expect(gl.activeTexture).not.toHaveBeenCalled();
    expect(gl.bindTexture).not.toHaveBeenCalled();
    expect(gl.drawArrays).toHaveBeenCalledTimes(3);
    expect(gl.uniform4fv).toHaveBeenCalledTimes(2);
  });

  it('should bind the resolved texture to texture unit 0', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
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
    );

    // result
    expect(gl.activeTexture).toHaveBeenCalledWith(gl.TEXTURE0);
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, texture);
  });

  it('should run the even-odd stencil pass then a single covering-quad composite draw call', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
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
    );

    // result
    expect(gl.enable).toHaveBeenCalledWith(gl.STENCIL_TEST);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(1, gl.TRIANGLE_FAN, 0, 4);
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(2, gl.TRIANGLES, 0, 6);
    expect(gl.disable).toHaveBeenCalledWith(gl.STENCIL_TEST);
  });

  it('should disable the texCoord attribute before the stencil-mask pass, so a texCoord left enabled by a PREVIOUS image draw does not invalidate this shape’s (smaller) mask buffer (regression: with two+ image fills on the canvas, the second one’s stencil mask silently failed to draw — GL_INVALID_OPERATION, "vertex buffer is not big enough" — leaving its fill invisible until reselected)', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    (gl.getAttribLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) => (name === 'a_texCoord' ? 1 : 0));

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
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
    );

    // result — texCoord (location 1) is disabled before the stencil-mask draw, then re-enabled only
    // for the final content draw, so the mask pass never depends on whatever texCoord's enabled
    // state happened to be left at by a previous call
    const disableOrder = (gl.disableVertexAttribArray as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
    const maskDrawOrder = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
    const enableTexCoordCall = (gl.enableVertexAttribArray as ReturnType<typeof vi.fn>).mock.calls.findIndex((call) => call[0] === 1);
    const enableTexCoordOrder = (gl.enableVertexAttribArray as ReturnType<typeof vi.fn>).mock.invocationCallOrder[enableTexCoordCall];

    expect(gl.disableVertexAttribArray).toHaveBeenCalledWith(1);
    expect(disableOrder).toBeLessThan(maskDrawOrder);
    expect(enableTexCoordOrder).toBeGreaterThan(maskDrawOrder);
  });

  it('should crop the covering quad UVs to the bounds-relative aspect ratio when the image is wider than the shape', () => {
    // mock — 40x40 (1:1) bounds, 80x40 (2:1) image: only the centered horizontal 50% band of the image is used
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
      buffer,
      null,
      null,
      faces,
      texture,
      { height: 40, width: 80 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
    );

    // result — call 0 is the stencil-mask face upload, call 1 is the covering quad (position + UV interleaved)
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    expect(Array.from(uploadedVertices.slice(2, 4))).toEqual([0.25, 0]);
    expect(Array.from(uploadedVertices.slice(6, 8))).toEqual([0.75, 0]);
  });

  it('should fall back to the full 0..1 UV range when the image size has not loaded yet', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(gl, program, imageProgram, buffer, null, null, faces, texture, undefined, 100, 100, IDENTITY_VIEWPORT, false);

    // result — call 0 is the stencil-mask face upload, call 1 is the covering quad (position + UV interleaved)
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    expect(Array.from(uploadedVertices.slice(2, 4))).toEqual([0, 0]);
    expect(Array.from(uploadedVertices.slice(6, 8))).toEqual([1, 0]);
  });

  it('should mirror the sampled UVs horizontally when the paint’s flipX is set, without moving the quad geometry', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
      buffer,
      null,
      null,
      faces,
      texture,
      undefined,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
      0,
      'fill',
      undefined,
      true,
      false,
    );

    // result — same corners as the unflipped case, but with U mirrored (0↔1)
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    expect(Array.from(uploadedVertices.slice(0, 2))).toEqual([0, 0]);
    expect(Array.from(uploadedVertices.slice(2, 4))).toEqual([1, 0]);
    expect(Array.from(uploadedVertices.slice(4, 6))).toEqual([40, 0]);
    expect(Array.from(uploadedVertices.slice(6, 8))).toEqual([0, 0]);
  });

  it('should mirror the sampled UVs vertically when the paint’s flipY is set', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
      buffer,
      null,
      null,
      faces,
      texture,
      undefined,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
      0,
      'fill',
      undefined,
      false,
      true,
    );

    // result — V mirrored (0↔1) instead of U
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    expect(Array.from(uploadedVertices.slice(2, 4))).toEqual([0, 1]);
    expect(Array.from(uploadedVertices.slice(6, 8))).toEqual([1, 1]);
  });

  it('should rotate the sampled UVs by 90° instead of the quad geometry, for a square image needing no crop', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
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
      1,
      90,
    );

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
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
      buffer,
      null,
      null,
      faces,
      texture,
      { height: 40, width: 80 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
      90,
    );

    // result — call 0 is the stencil-mask face upload, call 1 is the covering quad (position + UV interleaved)
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    expect(Array.from(uploadedVertices.slice(2, 4))).toEqual([0.25, 1]);
    expect(Array.from(uploadedVertices.slice(6, 8))).toEqual([0.25, 0]);
  });

  it('should default to fully opaque when no alpha is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const opacityLocation = { tag: 'opacity' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_opacity' ? opacityLocation : {},
    );

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
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
    );

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(opacityLocation, 1);
  });

  it('should upload the given alpha as the opacity uniform', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const opacityLocation = { tag: 'opacity' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_opacity' ? opacityLocation : {},
    );

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
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

  it("should shrink the quad to a letterboxed rect and keep the full 0..1 UV range for scaleMode 'fit'", () => {
    // mock — 40x40 (1:1) bounds, an 80x40 (2:1) image: fit shrinks the quad to 40x20, centered vertically
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
      buffer,
      null,
      null,
      faces,
      texture,
      { height: 40, width: 80 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
      0,
      'fit',
    );

    // result — call 0 is the stencil-mask face upload, call 1 is the fitted quad (position + UV interleaved)
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    // top-left corner of the fitted quad sits inset from the shape's own (0,0) corner, letterboxed
    expect(Array.from(uploadedVertices.slice(0, 2))).toEqual([0, 10]);
    // the whole (uncropped) image is used, not a cover-cropped band of it
    expect(Array.from(uploadedVertices.slice(2, 4))).toEqual([0, 0]);
    expect(Array.from(uploadedVertices.slice(6, 8))).toEqual([1, 0]);
  });

  it("should draw the full node bounds for scaleMode 'fill' even when a 'fit' image size would otherwise letterbox", () => {
    // mock — same 40x40 bounds / 80x40 image as the fit case above, but requesting 'fill' explicitly
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
      buffer,
      null,
      null,
      faces,
      texture,
      { height: 40, width: 80 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
      0,
      'fill',
    );

    // result — the quad covers the full 40x40 bounds, not a letterboxed sub-rect
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    expect(Array.from(uploadedVertices.slice(0, 2))).toEqual([0, 0]);
    expect(Array.from(uploadedVertices.slice(4, 6))).toEqual([40, 0]);
  });

  it('should draw the stored crop rect at full 0..1 UV, overriding scaleMode entirely once a crop is set', () => {
    // mock — 'fit' would otherwise letterbox to a smaller rect; crop must win instead
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
      buffer,
      null,
      null,
      faces,
      texture,
      { height: 40, width: 80 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
      0,
      'fit',
      { height: 15, rotation: 0, width: 20, x: 10, y: 5 },
    );

    // result — call 0 is the stencil-mask face upload, call 1 is the crop quad (position + UV interleaved)
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    expect(Array.from(uploadedVertices.slice(0, 2))).toEqual([10, 5]);
    expect(Array.from(uploadedVertices.slice(2, 4))).toEqual([0, 0]);
    expect(Array.from(uploadedVertices.slice(4, 6))).toEqual([30, 5]);
    expect(Array.from(uploadedVertices.slice(6, 8))).toEqual([1, 0]);
  });

  it("should rotate the crop quad's own geometry around its center when the crop has a rotation", () => {
    // mock — a 40x40 crop rect rotated 90deg around its own center (20,20)
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
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
      1,
      0,
      'fill',
      { height: 40, rotation: 90, width: 40, x: 0, y: 0 },
    );

    // result — call 0 is the stencil-mask face upload, call 1 is the crop quad (position + UV interleaved)
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    expect(uploadedVertices[0]).toBeCloseTo(40);
    expect(uploadedVertices[1]).toBeCloseTo(0);
    expect(uploadedVertices[4]).toBeCloseTo(40);
    expect(uploadedVertices[5]).toBeCloseTo(40);
  });

  it('should rotate a plain (uncropped) fill’s quad rigidly with boxRotation, instead of leaving it screen-aligned', () => {
    // mock — a square 40x40 image over 40x40 local bounds, rotated 90° around the shape's own
    // center (20,20): the top-left corner (0,0) must land where the top-right corner used to be
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const boxRotation = { center: { x: 20, y: 20 }, degrees: 90, localBounds: { height: 40, width: 40, x: 0, y: 0 } };

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
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
      1,
      0,
      'fill',
      undefined,
      false,
      false,
      boxRotation,
    );

    // result — call 0 is the stencil-mask face upload, call 1 is the covering quad (position + UV interleaved)
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    expect(uploadedVertices[0]).toBeCloseTo(40);
    expect(uploadedVertices[1]).toBeCloseTo(0);
  });

  it('should ignore boxRotation once a crop rect is set, since the crop’s own rotation already governs the quad', () => {
    // mock — same crop as the "rotate the crop quad's own geometry" case above; a boxRotation is
    // also supplied here but must have zero effect on the output
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const boxRotation = { center: { x: 20, y: 20 }, degrees: 45, localBounds: { height: 40, width: 40, x: 0, y: 0 } };

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
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
      1,
      0,
      'fill',
      { height: 40, rotation: 90, width: 40, x: 0, y: 0 },
      false,
      false,
      boxRotation,
    );

    // result — identical to the no-boxRotation crop-rotation case: crop.rotation alone governs
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    expect(uploadedVertices[0]).toBeCloseTo(40);
    expect(uploadedVertices[1]).toBeCloseTo(0);
    expect(uploadedVertices[4]).toBeCloseTo(40);
    expect(uploadedVertices[5]).toBeCloseTo(40);
  });

  it("should repeat the image's UVs beyond 0..1 for scaleMode 'tile', instead of cropping to a single band", () => {
    // mock — 40x40 bounds, a 20x20 image at 50% scale (10x10 tiles): 4 repeats per axis
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
      buffer,
      null,
      null,
      faces,
      texture,
      { height: 20, width: 20 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
      0,
      'tile',
      undefined,
      false,
      false,
      undefined,
      0.5,
    );

    // result — call 0 is the stencil-mask face upload, call 1 is the covering quad (position + UV interleaved)
    const uploadedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    expect(Array.from(uploadedVertices.slice(0, 2))).toEqual([0, 0]);
    expect(Array.from(uploadedVertices.slice(2, 4))).toEqual([0, 0]);
    expect(Array.from(uploadedVertices.slice(6, 8))).toEqual([4, 0]);
  });

  it("should switch the texture wrap mode to REPEAT only for scaleMode 'tile'", () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — a plain 'fill' draw first
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
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
    );

    // result
    expect(gl.texParameteri).toHaveBeenCalledWith(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    expect(gl.texParameteri).toHaveBeenCalledWith(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // before — then a 'tile' draw on the same (shared) texture
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
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
      1,
      0,
      'tile',
    );

    // result
    expect(gl.texParameteri).toHaveBeenCalledWith(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    expect(gl.texParameteri).toHaveBeenCalledWith(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  });

  it('should upload every adjustment as its own uniform, defaulting to the all-zero identity when none is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const locations = {
      u_contrast: { tag: 'contrast' },
      u_exposure: { tag: 'exposure' },
      u_highlights: { tag: 'highlights' },
      u_saturation: { tag: 'saturation' },
      u_shadows: { tag: 'shadows' },
      u_temperature: { tag: 'temperature' },
      u_tint: { tag: 'tint' },
    };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation(
      (_program, name: string) => locations[name as keyof typeof locations] ?? {},
    );

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
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
    );

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(locations.u_exposure, 0);
    expect(gl.uniform1f).toHaveBeenCalledWith(locations.u_contrast, 0);
    expect(gl.uniform1f).toHaveBeenCalledWith(locations.u_saturation, 0);
    expect(gl.uniform1f).toHaveBeenCalledWith(locations.u_temperature, 0);
    expect(gl.uniform1f).toHaveBeenCalledWith(locations.u_tint, 0);
    expect(gl.uniform1f).toHaveBeenCalledWith(locations.u_highlights, 0);
    expect(gl.uniform1f).toHaveBeenCalledWith(locations.u_shadows, 0);
  });

  it('should upload the paint’s own stored adjustment values as their uniforms', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const imageProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const locations = {
      u_contrast: { tag: 'contrast' },
      u_exposure: { tag: 'exposure' },
      u_highlights: { tag: 'highlights' },
      u_saturation: { tag: 'saturation' },
      u_shadows: { tag: 'shadows' },
      u_temperature: { tag: 'temperature' },
      u_tint: { tag: 'tint' },
    };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation(
      (_program, name: string) => locations[name as keyof typeof locations] ?? {},
    );

    // before
    drawVectorImageFill(
      gl,
      program,
      imageProgram,
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
      1,
      0,
      'fill',
      undefined,
      false,
      false,
      undefined,
      undefined,
      { contrast: -10, exposure: 42, highlights: 30, saturation: 20, shadows: -30, temperature: -20, tint: 15 },
    );

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(locations.u_exposure, 42);
    expect(gl.uniform1f).toHaveBeenCalledWith(locations.u_contrast, -10);
    expect(gl.uniform1f).toHaveBeenCalledWith(locations.u_saturation, 20);
    expect(gl.uniform1f).toHaveBeenCalledWith(locations.u_temperature, -20);
    expect(gl.uniform1f).toHaveBeenCalledWith(locations.u_tint, 15);
    expect(gl.uniform1f).toHaveBeenCalledWith(locations.u_highlights, 30);
    expect(gl.uniform1f).toHaveBeenCalledWith(locations.u_shadows, -30);
  });
});
