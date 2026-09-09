// types
import { StrokeAlign } from 'types/design/enums';
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { drawMsdfGlyphs } from '../drawMsdfGlyphs';

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
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const ATLAS: TGlyphAtlasJson = {
  chars: [{ height: 10, id: 55, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 }],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawMsdfGlyphs', () => {
  it('should draw a batched triangle quad per glyph', () => {
    // mock — one glyph's worth of vertices: 6 vertices * 4 floats each
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;
    const vertices = new Float32Array(24);

    // before
    drawMsdfGlyphs(gl, program, buffer, texture, ATLAS, vertices, '#ffffff', 20, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, texture);
  });

  it('should draw nothing when no texture is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const vertices = new Float32Array(24);

    // before
    drawMsdfGlyphs(gl, program, buffer, null, ATLAS, vertices, '#ffffff', 20, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when there are no vertices', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;

    // before
    drawMsdfGlyphs(gl, program, buffer, texture, ATLAS, new Float32Array(0), '#ffffff', 20, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should upload the given color as the color uniform', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;
    const vertices = new Float32Array(24);

    // before
    drawMsdfGlyphs(gl, program, buffer, texture, ATLAS, vertices, '#ff0000', 20, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), [1, 0, 0, 1]);
  });

  it('should upload the given stroke color and a non-zero stroke-width uniform when a positive stroke width is set', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;
    const vertices = new Float32Array(24);

    // before — screenPxRange = distanceRange (4) * effectiveFontSize (20) * zoom (1) / atlas size (20) = 4,
    // so strokeWidthUniform = strokeWidth (2) * zoom (1) / screenPxRange (4) = 0.5
    drawMsdfGlyphs(gl, program, buffer, texture, ATLAS, vertices, '#ffffff', 20, 100, 100, IDENTITY_VIEWPORT, '#ff0000', 2);

    // result
    expect(gl.uniform4fv).toHaveBeenNthCalledWith(2, expect.anything(), [1, 0, 0, 1]);
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 0.5);
  });

  it('should treat a zero stroke width as no stroke, falling back to the fill color and a zero stroke-width uniform', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;
    const vertices = new Float32Array(24);

    // before
    drawMsdfGlyphs(gl, program, buffer, texture, ATLAS, vertices, '#ffffff', 20, 100, 100, IDENTITY_VIEWPORT, '#ff0000', 0);

    // result — the stroke uniform mirrors the fill color, not the given stroke color
    expect(gl.uniform4fv).toHaveBeenNthCalledWith(2, expect.anything(), [1, 1, 1, 1]);
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 0);
  });

  it('should leave the stroke inset uniform at zero when no stroke alignment is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;
    const vertices = new Float32Array(24);

    // before — 3rd uniform1f call is u_strokeInset (after u_screenPxRange, u_strokeWidth)
    drawMsdfGlyphs(gl, program, buffer, texture, ATLAS, vertices, '#ffffff', 20, 100, 100, IDENTITY_VIEWPORT, '#ff0000', 4);

    // result
    expect(gl.uniform1f).toHaveBeenNthCalledWith(3, expect.anything(), 0);
  });

  it('should push the fill boundary inward by half the stroke for a centered text stroke', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;
    const vertices = new Float32Array(24);

    // before — screenPxRange 4, inset world = strokeWidth (4) / 2 = 2, uniform = 2 * zoom (1) / 4 = 0.5
    drawMsdfGlyphs(
      gl,
      program,
      buffer,
      texture,
      ATLAS,
      vertices,
      '#ffffff',
      20,
      100,
      100,
      IDENTITY_VIEWPORT,
      '#ff0000',
      4,
      StrokeAlign.center,
    );

    // result
    expect(gl.uniform1f).toHaveBeenNthCalledWith(3, expect.anything(), 0.5);
  });

  it('should push the fill boundary in by the whole stroke for an inside-aligned text stroke', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;
    const vertices = new Float32Array(24);

    // before — inset world = strokeWidth (4), uniform = 4 * zoom (1) / screenPxRange (4) = 1
    drawMsdfGlyphs(
      gl,
      program,
      buffer,
      texture,
      ATLAS,
      vertices,
      '#ffffff',
      20,
      100,
      100,
      IDENTITY_VIEWPORT,
      '#ff0000',
      4,
      StrokeAlign.inside,
    );

    // result
    expect(gl.uniform1f).toHaveBeenNthCalledWith(3, expect.anything(), 1);
  });

  it('should keep the stroke inset uniform at zero for an outside-aligned text stroke', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;
    const vertices = new Float32Array(24);

    // before
    drawMsdfGlyphs(
      gl,
      program,
      buffer,
      texture,
      ATLAS,
      vertices,
      '#ffffff',
      20,
      100,
      100,
      IDENTITY_VIEWPORT,
      '#ff0000',
      4,
      StrokeAlign.outside,
    );

    // result
    expect(gl.uniform1f).toHaveBeenNthCalledWith(3, expect.anything(), 0);
  });

  it('should compute screenPxRange from the atlas distance range, effective font size, and zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;
    const vertices = new Float32Array(24);

    // before — distanceRange (4) * effectiveFontSize (20) * zoom (2) / atlas size (20) = 8
    drawMsdfGlyphs(gl, program, buffer, texture, ATLAS, vertices, '#ffffff', 20, 100, 100, { x: 0, y: 0, zoom: 2 });

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 8);
  });
});
