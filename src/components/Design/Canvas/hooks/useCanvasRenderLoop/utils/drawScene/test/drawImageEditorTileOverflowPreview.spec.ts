// others
import { IMAGE_EDITOR_CROP_OVERFLOW_ALPHA } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { drawImageEditorTileOverflowPreview } from '../drawImageEditorTileOverflowPreview';
import { imagePaintTextureSizeCache } from 'utils/canvas/getOrLoadTexture';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const texture = {} as WebGLTexture;

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
    createTexture: vi.fn(),
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

const createContext = (gl: WebGL2RenderingContext): TDrawSceneContext =>
  ({
    buffer: {} as WebGLBuffer,
    canvasHeight: 100,
    canvasWidth: 100,
    gl,
    imageContext: {
      cache: new Map([['image-1', texture]]),
      imagePaintTextureSizeCache: new Map(),
      program: { tag: 'image' } as unknown as WebGLProgram,
    },
    program: {} as WebGLProgram,
    viewport: IDENTITY_VIEWPORT,
  }) as unknown as TDrawSceneContext;

const createNode = (rotation = 0): TRectangleNode => ({
  fills: [{ opacity: 100, ref: 'image-1', rotation: 0, scale: 0.5, scaleMode: 'tile', type: 'image' }],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
});

describe('drawImageEditorTileOverflowPreview', () => {
  afterEach(() => {
    imagePaintTextureSizeCache.clear();
  });

  it('should do nothing when there is no active image editor', () => {
    // mock
    const gl = createGlMock();

    // before
    drawImageEditorTileOverflowPreview(createContext(gl), { 'rect-1': createNode() }, null);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should do nothing while in position mode', () => {
    // mock
    const gl = createGlMock();

    // before
    drawImageEditorTileOverflowPreview(
      createContext(gl),
      { 'rect-1': createNode() },
      { mode: 'position', nodeId: 'rect-1', paintIndex: 0 },
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should do nothing when the targeted paint is not an image', () => {
    // mock
    const gl = createGlMock();
    const solidNode: TRectangleNode = { ...createNode(), fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }] };

    // before
    drawImageEditorTileOverflowPreview(createContext(gl), { 'rect-1': solidNode }, { mode: 'tile', nodeId: 'rect-1', paintIndex: 0 });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should do nothing when the image size has not loaded yet', () => {
    // mock
    const gl = createGlMock();

    // before
    drawImageEditorTileOverflowPreview(createContext(gl), { 'rect-1': createNode() }, { mode: 'tile', nodeId: 'rect-1', paintIndex: 0 });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should do nothing when the node is rotated (v1 scope: unrotated frames only)', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 20, width: 20 });
    const gl = createGlMock();

    // before
    drawImageEditorTileOverflowPreview(createContext(gl), { 'rect-1': createNode(25) }, { mode: 'tile', nodeId: 'rect-1', paintIndex: 0 });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw the tile rect, unclipped, at the fixed overflow alpha, once the image size is known', () => {
    // mock — a 20x20 source at 50% scale is a 10x10 tile rect anchored at the node's own (0,0)
    imagePaintTextureSizeCache.set('image-1', { height: 20, width: 20 });
    const gl = createGlMock();

    // before
    drawImageEditorTileOverflowPreview(createContext(gl), { 'rect-1': createNode() }, { mode: 'tile', nodeId: 'rect-1', paintIndex: 0 });

    // result
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, texture);
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), IMAGE_EDITOR_CROP_OVERFLOW_ALPHA);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);

    const vertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0][1] as Float32Array;

    expect(Array.from(vertices.slice(0, 2))).toEqual([0, 0]);
    expect(Array.from(vertices.slice(4, 6))).toEqual([10, 0]);
  });
});
