// types
import { NodeType, PathType } from 'types/design/enums';
import { TImageRenderContext } from '../../../../types';
import {
  TBoxSceneNode,
  TGroupNode,
  TMediaNode,
  TPathNode,
  TPolygonNode,
  TSceneNode,
  TSectionNode,
  TStarNode,
  TTextNode,
  TVectorNode,
} from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawSceneNodes } from '../drawSceneNodes';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    COLOR_BUFFER_BIT: 16384,
    FRAMEBUFFER: 36160,
    LINES: 1,
    LINE_LOOP: 2,
    ONE: 1,
    ONE_MINUS_SRC_ALPHA: 771,
    RGBA: 6408,
    SRC_ALPHA: 770,
    STATIC_DRAW: 35044,
    STENCIL_BUFFER_BIT: 1024,
    TEXTURE0: 33984,
    TEXTURE1: 33985,
    TEXTURE_2D: 3553,
    TRIANGLES: 4,
    TRIANGLE_FAN: 6,
    UNSIGNED_BYTE: 5121,
    activeTexture: vi.fn(),
    bindBuffer: vi.fn(),
    bindFramebuffer: vi.fn(),
    bindTexture: vi.fn(),
    blendFunc: vi.fn(),
    blendFuncSeparate: vi.fn(),
    bufferData: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    colorMask: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    createTexture: vi.fn(() => ({})),
    drawArrays: vi.fn(),
    drawingBufferHeight: 200,
    drawingBufferWidth: 200,
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
    viewport: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const IMAGE_CONTEXT: TImageRenderContext = {
  buffer: {} as WebGLBuffer,
  cache: new Map(),
  ellipseArcLengthCache: new Map(),
  faceBufferCache: new WeakMap(),
  gridBuffer: {} as WebGLBuffer,
  gridProgram: {} as WebGLProgram,
  maskCompositeBuffer: {} as WebGLBuffer,
  maskCompositeProgram: {} as WebGLProgram,
  msdfBuffer: {} as WebGLBuffer,
  msdfProgram: {} as WebGLProgram,
  program: {} as WebGLProgram,
  renderTargetPool: {} as TImageRenderContext['renderTargetPool'],
  strokeBufferCache: new WeakMap(),
  textGeometryCache: new Map(),
  vertexDotBufferCache: new WeakMap(),
};

type TTargetStub = { framebuffer: object; height: number; stencil: object; texture: object; width: number };

type TPoolStub = {
  acquire: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
  release: ReturnType<typeof vi.fn>;
  targets: TTargetStub[];
};

const createPoolStub = (): TPoolStub => {
  const targets: TTargetStub[] = [];
  const acquire = vi.fn(() => {
    const target = { framebuffer: {}, height: 200, stencil: {}, texture: {}, width: 200 };
    targets.push(target);

    return target;
  });

  return { acquire, dispose: vi.fn(), release: vi.fn(), targets };
};

const withPool = (pool: ReturnType<typeof createPoolStub>): TImageRenderContext => ({
  ...IMAGE_CONTEXT,
  renderTargetPool: pool as unknown as TImageRenderContext['renderTargetPool'],
});

const buildNode = (
  overrides: Partial<Exclude<TBoxSceneNode, TPathNode | TPolygonNode | TSectionNode | TStarNode | TMediaNode | TTextNode>>,
): TSceneNode =>
  ({
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
  }) as TSceneNode;

describe('drawSceneNodes', () => {
  it('should draw nothing when there are no nodes', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      [],
      [],
      new Map(),
      createCanvasRefs(),
      {},
    );

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
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      [],
      new Map(),
      createCanvasRefs(),
      {},
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should also draw a thick stroke outline for a default-shape node with a stroke color and width', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const nodes = [buildNode({ id: 'a', strokeColor: '#000000', strokeWidth: 2 })];

    // before
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      [],
      new Map(),
      createCanvasRefs(),
      {},
    );

    // result — one fill + one thick-outline draw call
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it('should draw nothing for a group node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const group = {
      childIds: ['a'],
      height: 10,
      id: 'group-1',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 10,
      x: 0,
      y: 0,
    } as TSceneNode;

    // before
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      [group],
      [],
      new Map(),
      createCanvasRefs(),
      {},
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw a filled ellipse for an ellipse node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const nodes = [buildNode({ id: 'a', type: NodeType.ellipse })];

    // before
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      [],
      new Map(),
      createCanvasRefs(),
      {},
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
  });

  it('should also draw a thick stroke outline for an ellipse node with a stroke color and width', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const nodes = [buildNode({ id: 'a', strokeColor: '#000000', strokeWidth: 2, type: NodeType.ellipse })];

    // before
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      [],
      new Map(),
      createCanvasRefs(),
      {},
    );

    // result — one fill + one thick-outline draw call
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it('should draw a filled polygon for a polygon node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const polygon: TSceneNode = {
      fill: '#ff0000',
      flipX: false,
      flipY: false,
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
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      [polygon],
      [],
      new Map(),
      createCanvasRefs(),
      {},
    );

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
      flipX: false,
      flipY: false,
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
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      [star],
      [],
      new Map(),
      createCanvasRefs(),
      {},
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
  });

  it('should draw a textured quad for a media node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const media: TSceneNode = {
      flipX: false,
      flipY: false,
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
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      [media],
      [],
      new Map(),
      createCanvasRefs(),
      {},
    );

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
      flipX: false,
      flipY: false,
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
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      [text],
      [],
      new Map(),
      createCanvasRefs(),
      {},
    );

    // result — "hello" is 5 known glyphs in the real MSDF atlas, 6 vertices each
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 30);
  });

  it('should draw nothing for a path node when it has no outline style', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const path: TPathNode = {
      height: 10,
      id: 'a',
      name: 'Path',
      parentId: null,
      pathType: PathType.ellipse,
      rotation: 0,
      type: NodeType.path,
      width: 10,
      x: 0,
      y: 0,
    };

    // before
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      [path],
      [],
      new Map(),
      createCanvasRefs(),
      {},
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw a stroke-only ellipse outline for a selected path node, not a filled shape', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const path: TPathNode = {
      height: 10,
      id: 'a',
      name: 'Path',
      parentId: null,
      pathType: PathType.ellipse,
      rotation: 0,
      type: NodeType.path,
      width: 10,
      x: 0,
      y: 0,
    };

    // before
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      [path],
      [],
      new Map([['a', 'selected']]),
      createCanvasRefs(),
      {},
    );

    // result — a stroke-only ellipse draws a LINE_LOOP, no filled TRIANGLE_FAN
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, expect.any(Number));
  });

  it('should draw a thick outline for a hovered path node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const path: TPathNode = {
      height: 10,
      id: 'a',
      name: 'Path',
      parentId: null,
      pathType: PathType.ellipse,
      rotation: 0,
      type: NodeType.path,
      width: 10,
      x: 0,
      y: 0,
    };

    // before
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      [path],
      [],
      new Map([['a', 'hover']]),
      createCanvasRefs(),
      {},
    );

    // result — a thick outline is built from triangle quads, not a hairline loop
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, expect.any(Number));
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
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      [line],
      [],
      new Map(),
      createCanvasRefs(),
      {},
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should also draw an arrowhead for a line node whose endPoint is set to arrow', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const line: TSceneNode = {
      endPoint: 'arrow',
      id: 'a',
      name: 'Arrow',
      parentId: null,
      stroke: '#000000',
      type: NodeType.line,
      x1: 0,
      x2: 10,
      y1: 0,
      y2: 10,
    };

    // before
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      [line],
      [],
      new Map(),
      createCanvasRefs(),
      {},
    );

    // result — 1 segment + (2 wing quads + 3 round-cap fills) for the single arrow endpoint
    expect(gl.drawArrays).toHaveBeenCalledTimes(6);
  });

  it('should draw a stroked vector node from its segments', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const vector: TVectorNode = {
      fillColor: null,
      filledFaceKeys: [],
      id: 'a',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 2,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 10 } },
    };

    // before
    drawSceneNodes(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      [vector],
      [],
      new Map(),
      createCanvasRefs(),
      {},
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, expect.any(Number));
  });

  // the vector-as-text-path-guide decision (dashed outline vs. own stroke vs. nothing) lives in
  // drawVectorNodeOrTextPathGuide.ts — see its own spec for that branching in detail.

  describe('mask groups', () => {
    const buildMaskScene = (): { nodes: TSceneNode[]; nodesById: Record<string, TSceneNode>; rootOrder: string[] } => {
      const content = buildNode({ id: 'content', parentId: 'group' });
      const mask = buildNode({ id: 'mask', isMask: true, parentId: 'group' });
      const group: TGroupNode = {
        childIds: ['content', 'mask'],
        height: 10,
        id: 'group',
        name: 'Mask group',
        parentId: null,
        rotation: 0,
        type: NodeType.group,
        width: 10,
        x: 0,
        y: 0,
      };

      return { nodes: [group, content, mask], nodesById: { content, group, mask }, rootOrder: ['group'] };
    };

    it('should render masked content and the mask into two offscreen targets and composite them back', () => {
      // mock
      const gl = createGlMock();
      const pool = createPoolStub();
      const { nodes, nodesById, rootOrder } = buildMaskScene();

      // action
      drawSceneNodes(
        {
          buffer: {} as WebGLBuffer,
          canvasHeight: 100,
          canvasWidth: 100,
          gl,
          imageContext: withPool(pool),
          program: {} as WebGLProgram,
          viewport: IDENTITY_VIEWPORT,
        },
        nodes,
        rootOrder,
        new Map(),
        createCanvasRefs(),
        nodesById,
      );

      // result
      expect(pool.acquire).toHaveBeenCalledTimes(2);
      expect(pool.release).toHaveBeenCalledTimes(2);
      expect(gl.blendFuncSeparate).toHaveBeenCalledWith(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      // two offscreen binds (content + mask), then a final rebind to the default framebuffer
      expect(gl.bindFramebuffer).toHaveBeenCalledWith(gl.FRAMEBUFFER, pool.targets[0].framebuffer);
      expect(gl.bindFramebuffer).toHaveBeenCalledWith(gl.FRAMEBUFFER, pool.targets[1].framebuffer);
      expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, null);
      // the composite pass draws its full-screen quad
      expect(gl.useProgram).toHaveBeenCalledWith(IMAGE_CONTEXT.maskCompositeProgram);
      expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
    });

    it('should mask nothing when the mask is the first child (top of the panel, nothing above it)', () => {
      // mock
      const gl = createGlMock();
      const pool = createPoolStub();
      const content = buildNode({ id: 'content', parentId: 'group' });
      const mask = buildNode({ id: 'mask', isMask: true, parentId: 'group' });
      const group: TGroupNode = {
        childIds: ['mask', 'content'],
        height: 10,
        id: 'group',
        name: 'Mask group',
        parentId: null,
        rotation: 0,
        type: NodeType.group,
        width: 10,
        x: 0,
        y: 0,
      };

      // action
      drawSceneNodes(
        {
          buffer: {} as WebGLBuffer,
          canvasHeight: 100,
          canvasWidth: 100,
          gl,
          imageContext: withPool(pool),
          program: {} as WebGLProgram,
          viewport: IDENTITY_VIEWPORT,
        },
        [group, content, mask],
        ['group'],
        new Map(),
        createCanvasRefs(),
        { content, group, mask },
      );

      // result
      expect(pool.acquire).not.toHaveBeenCalled();
      expect(gl.drawArrays).toHaveBeenCalledTimes(1); // just the plain content rect
    });

    it('should never touch framebuffer or pool state for a scene with no mask node', () => {
      // mock
      const gl = createGlMock();
      const pool = createPoolStub();
      const a = buildNode({ id: 'a' });
      const b = buildNode({ id: 'b' });

      // action
      drawSceneNodes(
        {
          buffer: {} as WebGLBuffer,
          canvasHeight: 100,
          canvasWidth: 100,
          gl,
          imageContext: withPool(pool),
          program: {} as WebGLProgram,
          viewport: IDENTITY_VIEWPORT,
        },
        [a, b],
        ['a', 'b'],
        new Map(),
        createCanvasRefs(),
        { a, b },
      );

      // result
      expect(pool.acquire).not.toHaveBeenCalled();
      expect(gl.bindFramebuffer).not.toHaveBeenCalled();
      expect(gl.blendFuncSeparate).not.toHaveBeenCalled();
    });

    it('should silently skip a child id that is not in the visible scene (e.g. hidden)', () => {
      // mock
      const gl = createGlMock();
      const pool = createPoolStub();
      const visible = buildNode({ id: 'visible', parentId: 'group' });
      const mask = buildNode({ id: 'mask', isMask: true, parentId: 'group' });
      const group: TGroupNode = {
        childIds: ['hidden-child', 'visible', 'mask'],
        height: 10,
        id: 'group',
        name: 'Mask group',
        parentId: null,
        rotation: 0,
        type: NodeType.group,
        width: 10,
        x: 0,
        y: 0,
      };

      // action — 'hidden-child' is in childIds but absent from the scene node list
      drawSceneNodes(
        {
          buffer: {} as WebGLBuffer,
          canvasHeight: 100,
          canvasWidth: 100,
          gl,
          imageContext: withPool(pool),
          program: {} as WebGLProgram,
          viewport: IDENTITY_VIEWPORT,
        },
        [group, mask, visible],
        ['group'],
        new Map(),
        createCanvasRefs(),
        { group, mask, visible },
      );

      // result — still composites, only the one visible content child is drawn
      expect(pool.acquire).toHaveBeenCalledTimes(2);
      expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
    });

    it('should recurse into a plain (non-mask) nested group inside masked content', () => {
      // mock
      const gl = createGlMock();
      const pool = createPoolStub();
      const leafA = buildNode({ id: 'leaf-a', parentId: 'inner' });
      const leafB = buildNode({ id: 'leaf-b', parentId: 'inner' });
      const mask = buildNode({ id: 'mask', isMask: true, parentId: 'group' });
      const inner: TGroupNode = {
        childIds: ['leaf-a', 'leaf-b'],
        height: 10,
        id: 'inner',
        name: 'Group',
        parentId: 'group',
        rotation: 0,
        type: NodeType.group,
        width: 10,
        x: 0,
        y: 0,
      };
      const group: TGroupNode = {
        childIds: ['inner', 'mask'],
        height: 10,
        id: 'group',
        name: 'Mask group',
        parentId: null,
        rotation: 0,
        type: NodeType.group,
        width: 10,
        x: 0,
        y: 0,
      };

      // action
      drawSceneNodes(
        {
          buffer: {} as WebGLBuffer,
          canvasHeight: 100,
          canvasWidth: 100,
          gl,
          imageContext: withPool(pool),
          program: {} as WebGLProgram,
          viewport: IDENTITY_VIEWPORT,
        },
        [group, mask, inner, leafA, leafB],
        ['group'],
        new Map(),
        createCanvasRefs(),
        { group, inner, 'leaf-a': leafA, 'leaf-b': leafB, mask },
      );

      // result — the nested plain group is recursed into (both leaves drawn) and the scope
      // still composites: two targets + the mask + the two content leaves all produce draws
      expect(pool.acquire).toHaveBeenCalledTimes(2);
      expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
      const rectDraws = (gl.drawArrays as unknown as { mock: { calls: unknown[][] } }).mock.calls.filter(([, , count]) => count === 6);
      // leaf-a, leaf-b, mask (each a 6-vertex rect) + the composite quad
      expect(rectDraws.length).toBeGreaterThanOrEqual(4);
    });
  });
});
