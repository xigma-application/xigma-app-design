// types
import { NodeType } from 'types/design/enums';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode } from 'types/design/types';

// utils
import { drawMsdfText } from '../drawMsdfText';

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
  chars: [
    { height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 },
    { height: 10, id: 66, width: 8, x: 8, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 },
  ],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createNode = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'AB',
  fill: '#ffffff',
  fontFamily: 'Inter',
  fontSize: 20,
  height: 20,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawMsdfText', () => {
  it('should draw a batched quad per glyph when a texture and wrapped content are present', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;

    // before
    drawMsdfText(gl, program, buffer, texture, ATLAS, new Map(), createNode(), 100, 100, IDENTITY_VIEWPORT);

    // result — "AB" is two known glyphs, 6 vertices each
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 12);
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, texture);
  });

  it('should draw nothing when no texture is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawMsdfText(gl, program, buffer, null, ATLAS, new Map(), createNode(), 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the node has no content', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;

    // before
    drawMsdfText(gl, program, buffer, texture, ATLAS, new Map(), createNode({ content: '' }), 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should upload the node fill color as the color uniform', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;

    // before
    drawMsdfText(gl, program, buffer, texture, ATLAS, new Map(), createNode({ fill: '#ff0000' }), 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), [1, 0, 0, 1]);
  });

  it('should compute screenPxRange from the atlas distance range, font size, and zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;

    // before — distanceRange (4) * fontSize (20) * zoom (2) / atlas size (20) = 8
    drawMsdfText(gl, program, buffer, texture, ATLAS, new Map(), createNode({ fontSize: 20 }), 100, 100, { x: 0, y: 0, zoom: 2 });

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 8);
  });

  it('should reuse cached geometry across calls for the same node, without rebuilding it', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const texture = {} as WebGLTexture;
    const cache = new Map<string, Float32Array>();
    const node = createNode();

    // before
    drawMsdfText(gl, program, buffer, texture, ATLAS, cache, node, 100, 100, IDENTITY_VIEWPORT);
    drawMsdfText(gl, program, buffer, texture, ATLAS, cache, node, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(cache.size).toBe(1);
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });
});
