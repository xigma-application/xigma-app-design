// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TRenderTarget, TRenderTargetPool } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolvePatternSourceTile } from '../resolvePatternSourceTile';

const drawLeafNodeMock = vi.fn();

vi.mock('../drawLeafNode', () => ({ drawLeafNode: (...args: unknown[]): void => drawLeafNodeMock(...args) }));

const createGlMock = (): WebGL2RenderingContext =>
  ({
    BLEND_DST_ALPHA: 32970,
    BLEND_DST_RGB: 32968,
    BLEND_SRC_ALPHA: 32971,
    BLEND_SRC_RGB: 32969,
    COLOR_BUFFER_BIT: 16384,
    FRAMEBUFFER: 36160,
    FRAMEBUFFER_BINDING: 36006,
    ONE: 1,
    ONE_MINUS_SRC_ALPHA: 771,
    SRC_ALPHA: 770,
    STENCIL_BUFFER_BIT: 1024,
    VIEWPORT: 2978,
    bindFramebuffer: vi.fn(),
    blendFuncSeparate: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    colorMask: vi.fn(),
    getParameter: vi.fn((param: number) => {
      if (param === 36006) {
        return { tag: 'previous-framebuffer' };
      }

      if (param === 2978) {
        return new Int32Array([0, 0, 200, 200]);
      }

      return `blend-func-${param}`;
    }),
    viewport: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const rect = (id: string, overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    fills: [],
    height: 20,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 20,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('resolvePatternSourceTile', () => {
  const refs = createCanvasRefs();
  const pathOutlineStyles = new Map();

  beforeEach(() => {
    drawLeafNodeMock.mockClear();
  });

  it('should return null once the max resolution depth is reached, without touching the pool', () => {
    // mock
    const gl = createGlMock();
    const pool = { acquire: vi.fn(), release: vi.fn() } as unknown as TRenderTargetPool;
    const context = { gl, imageContext: { renderTargetPool: pool } } as unknown as TDrawSceneContext;
    const nodesById = { r1: rect('r1') };

    // before
    const resolved = resolvePatternSourceTile(context, 'r1', nodesById, pathOutlineStyles, refs, null, 4);

    // result
    expect(resolved).toBeNull();
    expect(pool.acquire).not.toHaveBeenCalled();
  });

  it('should return null when the source node does not exist', () => {
    // mock
    const gl = createGlMock();
    const pool = { acquire: vi.fn(), release: vi.fn() } as unknown as TRenderTargetPool;
    const context = { gl, imageContext: { renderTargetPool: pool } } as unknown as TDrawSceneContext;

    // before
    const resolved = resolvePatternSourceTile(context, 'missing', {}, pathOutlineStyles, refs, null, 0);

    // result
    expect(resolved).toBeNull();
  });

  it('should return null for a hidden source node', () => {
    // mock
    const gl = createGlMock();
    const pool = { acquire: vi.fn(), release: vi.fn() } as unknown as TRenderTargetPool;
    const context = { gl, imageContext: { renderTargetPool: pool } } as unknown as TDrawSceneContext;
    const nodesById = { r1: rect('r1', { hidden: true }) };

    // before
    const resolved = resolvePatternSourceTile(context, 'r1', nodesById, pathOutlineStyles, refs, null, 0);

    // result
    expect(resolved).toBeNull();
  });

  it('should return null for a degenerate (zero-size) source node', () => {
    // mock
    const gl = createGlMock();
    const pool = { acquire: vi.fn(), release: vi.fn() } as unknown as TRenderTargetPool;
    const context = { gl, imageContext: { renderTargetPool: pool } } as unknown as TDrawSceneContext;
    const nodesById = { r1: rect('r1', { height: 0 }) };

    // before
    const resolved = resolvePatternSourceTile(context, 'r1', nodesById, pathOutlineStyles, refs, null, 0);

    // result
    expect(resolved).toBeNull();
  });

  it('should render the source subtree into an acquired render target and return its world tile', () => {
    // mock
    const gl = createGlMock();
    const target = { framebuffer: {}, height: 200, texture: { tag: 'tile-texture' }, width: 200 } as unknown as TRenderTarget;
    const pool = { acquire: vi.fn(() => target), release: vi.fn() } as unknown as TRenderTargetPool;
    const context = {
      gl,
      imageContext: { isAlphaWriteEnabled: false, renderTargetPool: pool },
    } as unknown as TDrawSceneContext;
    const child = rect('c1');
    const parent = { ...rect('f1', { height: 30, width: 30, x: 5, y: 10 }), childIds: ['c1'], type: NodeType.frame } as TSceneNode;
    const nodesById = { c1: child, f1: parent };

    // before
    const resolved = resolvePatternSourceTile(context, 'f1', nodesById, pathOutlineStyles, refs, 'editing-id', 1);

    // result — both the source and its child were drawn, at one deeper resolution depth
    expect(pool.acquire).toHaveBeenCalledTimes(1);
    expect(gl.bindFramebuffer).toHaveBeenCalledWith(gl.FRAMEBUFFER, target.framebuffer);
    expect(drawLeafNodeMock).toHaveBeenCalledTimes(2);
    expect(drawLeafNodeMock).toHaveBeenNthCalledWith(1, context, parent, pathOutlineStyles, refs, nodesById, 'editing-id', 2);
    expect(drawLeafNodeMock).toHaveBeenNthCalledWith(2, context, child, pathOutlineStyles, refs, nodesById, 'editing-id', 2);

    // result — the previous framebuffer/viewport is restored afterwards
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, { tag: 'previous-framebuffer' });
    expect(gl.viewport).toHaveBeenLastCalledWith(0, 0, 200, 200);

    // result — the resolved tile matches the source's own world bounds and the acquired texture
    expect(resolved).not.toBeNull();
    expect(resolved?.tile).toEqual({ height: 30, texture: target.texture, width: 30, x: 5, y: 10 });

    // action
    resolved?.release();

    // result
    expect(pool.release).toHaveBeenCalledWith(target);
  });
});
