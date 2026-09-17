// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TRenderTarget, TRenderTargetPool } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveFrozenPatternSourceTile } from '../resolveFrozenPatternSourceTile';

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

describe('resolveFrozenPatternSourceTile', () => {
  const refs = createCanvasRefs();
  const pathOutlineStyles = new Map();

  beforeEach(() => {
    drawLeafNodeMock.mockClear();
  });

  it('should return null for an empty snapshot', () => {
    // mock
    const gl = createGlMock();
    const pool = { acquire: vi.fn(), release: vi.fn() } as unknown as TRenderTargetPool;
    const context = { gl, imageContext: { renderTargetPool: pool } } as unknown as TDrawSceneContext;

    // before
    const resolved = resolveFrozenPatternSourceTile(context, [], pathOutlineStyles, refs, null, 0);

    // result
    expect(resolved).toBeNull();
    expect(pool.acquire).not.toHaveBeenCalled();
  });

  it('should return null once the max resolution depth is reached', () => {
    // mock
    const gl = createGlMock();
    const pool = { acquire: vi.fn(), release: vi.fn() } as unknown as TRenderTargetPool;
    const context = { gl, imageContext: { renderTargetPool: pool } } as unknown as TDrawSceneContext;

    // before
    const resolved = resolveFrozenPatternSourceTile(context, [rect('r1')], pathOutlineStyles, refs, null, 4);

    // result
    expect(resolved).toBeNull();
  });

  it('should return null for a hidden root node', () => {
    // mock
    const gl = createGlMock();
    const pool = { acquire: vi.fn(), release: vi.fn() } as unknown as TRenderTargetPool;
    const context = { gl, imageContext: { renderTargetPool: pool } } as unknown as TDrawSceneContext;

    // before
    const resolved = resolveFrozenPatternSourceTile(context, [rect('r1', { hidden: true })], pathOutlineStyles, refs, null, 0);

    // result
    expect(resolved).toBeNull();
  });

  it('should return null for a degenerate (zero-size) root node', () => {
    // mock
    const gl = createGlMock();
    const pool = { acquire: vi.fn(), release: vi.fn() } as unknown as TRenderTargetPool;
    const context = { gl, imageContext: { renderTargetPool: pool } } as unknown as TDrawSceneContext;

    // before
    const resolved = resolveFrozenPatternSourceTile(context, [rect('r1', { width: 0 })], pathOutlineStyles, refs, null, 0);

    // result
    expect(resolved).toBeNull();
  });

  it('should render every frozen node into an acquired render target and return the tile, using a capture viewport anchored to the root’s own bounds instead of the live one', () => {
    // mock
    const gl = createGlMock();
    const target = { framebuffer: {}, height: 200, texture: { tag: 'tile-texture' }, width: 200 } as unknown as TRenderTarget;
    const pool = { acquire: vi.fn(() => target), release: vi.fn() } as unknown as TRenderTargetPool;
    const liveViewport = { x: 40, y: 40, zoom: 4 };
    const context = {
      canvasHeight: 200,
      canvasWidth: 200,
      gl,
      imageContext: { isAlphaWriteEnabled: false, renderTargetPool: pool },
      viewport: liveViewport,
    } as unknown as TDrawSceneContext;
    const root = rect('r1', { height: 30, width: 30, x: 5, y: 10 });
    const child = rect('c1');
    const snapshot = [root, child];
    const viewportsDuringDraw: unknown[] = [];

    drawLeafNodeMock.mockImplementation((ctx: TDrawSceneContext) => {
      viewportsDuringDraw.push({ ...ctx.viewport });
    });

    // before
    const resolved = resolveFrozenPatternSourceTile(context, snapshot, pathOutlineStyles, refs, 'editing-id', 1);
    const captureViewport = { x: -5 * (200 / 30), y: -10 * (200 / 30), zoom: 200 / 30 };

    // result — every node in the frozen snapshot is drawn, using a nodesById built from the
    // snapshot itself, while the shared context's viewport was temporarily swapped to a capture
    // viewport anchored to the root's own bounds
    expect(drawLeafNodeMock).toHaveBeenCalledTimes(2);
    expect(drawLeafNodeMock).toHaveBeenNthCalledWith(1, context, root, pathOutlineStyles, refs, { c1: child, r1: root }, 'editing-id', 2);
    expect(drawLeafNodeMock).toHaveBeenNthCalledWith(2, context, child, pathOutlineStyles, refs, { c1: child, r1: root }, 'editing-id', 2);
    expect(viewportsDuringDraw).toEqual([captureViewport, captureViewport]);
    expect(context.viewport).toBe(liveViewport);

    expect(resolved?.tile).toEqual({ height: 30, texture: target.texture, viewport: captureViewport, width: 30, x: 5, y: 10 });

    // action
    resolved?.release();

    // result
    expect(pool.release).toHaveBeenCalledWith(target);
  });
});
