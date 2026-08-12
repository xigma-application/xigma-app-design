// types
import { NodeType } from 'types/design/enums';
import { TImageRenderContext } from '../../../types';
import { TBoxSceneNode, TMediaNode, TPolygonNode, TSceneNode, TStarNode, TTextNode } from 'types/design/types';

// utils
import { drawSceneNodes } from '../drawSceneNodes';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    RGBA: 6408,
    STATIC_DRAW: 35044,
    TEXTURE0: 33984,
    TEXTURE_2D: 3553,
    TRIANGLES: 4,
    TRIANGLE_FAN: 6,
    UNSIGNED_BYTE: 5121,
    activeTexture: vi.fn(),
    bindBuffer: vi.fn(),
    bindTexture: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    createTexture: vi.fn(() => ({})),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    generateMipmap: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const IMAGE_CONTEXT: TImageRenderContext = {
  buffer: {} as WebGLBuffer,
  cache: new Map(),
  msdfBuffer: {} as WebGLBuffer,
  msdfProgram: {} as WebGLProgram,
  program: {} as WebGLProgram,
  textGeometryCache: new Map(),
};

const buildNode = (overrides: Partial<Exclude<TBoxSceneNode, TPolygonNode | TStarNode | TMediaNode | TTextNode>>): TSceneNode => ({
  fill: '#ff0000',
  height: 10,
  id: 'node',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawSceneNodes', () => {
  it('should draw nothing when there are no nodes', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSceneNodes(gl, program, buffer, IMAGE_CONTEXT, [], 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw a filled rect for every node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const nodes = [buildNode({ id: 'a' }), buildNode({ id: 'b' })];

    // before
    drawSceneNodes(gl, program, buffer, IMAGE_CONTEXT, nodes, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should draw a filled ellipse for an ellipse node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const nodes = [buildNode({ id: 'a', type: NodeType.ellipse })];

    // before
    drawSceneNodes(gl, program, buffer, IMAGE_CONTEXT, nodes, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
  });

  it('should draw a filled polygon for a polygon node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const polygon: TSceneNode = {
      fill: '#ff0000',
      height: 10,
      id: 'a',
      name: 'Polygon',
      parentId: null,
      rotation: 0,
      sides: 5,
      type: NodeType.polygon,
      width: 10,
      x: 0,
      y: 0,
    };

    // before
    drawSceneNodes(gl, program, buffer, IMAGE_CONTEXT, [polygon], 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
  });

  it('should draw a filled star for a star node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const star: TSceneNode = {
      fill: '#ff0000',
      height: 10,
      id: 'a',
      name: 'Star',
      parentId: null,
      points: 5,
      ratio: 0.382,
      rotation: 0,
      type: NodeType.star,
      width: 10,
      x: 0,
      y: 0,
    };

    // before
    drawSceneNodes(gl, program, buffer, IMAGE_CONTEXT, [star], 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
  });

  it('should draw a textured quad for a media node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const media: TSceneNode = {
      height: 10,
      id: 'a',
      name: 'Image',
      parentId: null,
      rotation: 0,
      src: 'image.png',
      type: NodeType.media,
      width: 10,
      x: 0,
      y: 0,
    };

    // before
    drawSceneNodes(gl, program, buffer, IMAGE_CONTEXT, [media], 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should draw a batched glyph quad for a text node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const text: TSceneNode = {
      content: 'hello',
      fill: '#ffffff',
      fontFamily: 'Inter',
      fontSize: 14,
      height: 10,
      id: 'a',
      name: 'Text',
      parentId: null,
      rotation: 0,
      type: NodeType.text,
      width: 100,
      x: 0,
      y: 0,
    };

    // before
    drawSceneNodes(gl, program, buffer, IMAGE_CONTEXT, [text], 100, 100, IDENTITY_VIEWPORT);

    // result — "hello" is 5 known glyphs in the real MSDF atlas, 6 vertices each
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 30);
  });

  it('should draw a thin segment for a line node instead of a filled rect', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const line: TSceneNode = {
      id: 'a',
      name: 'Line',
      parentId: null,
      stroke: '#000000',
      type: NodeType.line,
      x1: 0,
      x2: 10,
      y1: 0,
      y2: 10,
    };

    // before
    drawSceneNodes(gl, program, buffer, IMAGE_CONTEXT, [line], 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });
});
