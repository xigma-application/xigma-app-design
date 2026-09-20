// types
import { EffectType, NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { applyGlassEffect } from '../applyGlassEffect';
import { createEffect } from 'utils/design/effects/createEffect';

const calls: string[] = [];
const bindTargetMock = vi.fn();
const blitGlassCacheEntryMock = vi.fn();
const compositeMaskMock = vi.fn();
const getGlassCacheHitMock = vi.fn();
const getIsolatedScissorRectMock = vi.fn();
const paintBackgroundBlurShapeMock = vi.fn();
const renderFreshGlassWarpMock = vi.fn();
const setScissorRectMock = vi.fn();
const storeGlassCacheEntryMock = vi.fn();
const getStateMock = vi.fn();

const RECT = { clipped: false, height: 80, offscreen: false, originX: 0, originY: 0, rawHeight: 80, rawWidth: 100, width: 100, x: 0, y: 0 };
const NODES_STATE = { tag: 'nodes-state' };

vi.mock('store', () => ({ store: { getState: (): unknown => getStateMock() } }));
vi.mock('store/design/selectors', () => ({ selectNodes: (): unknown => NODES_STATE }));
vi.mock('../bindTarget', () => ({ bindTarget: (...args: unknown[]): number => calls.push('bind') && bindTargetMock(...args) }));
vi.mock('../blitGlassCacheEntry', () => ({
  blitGlassCacheEntry: (...args: unknown[]): number => calls.push('blit') && blitGlassCacheEntryMock(...args),
}));
vi.mock('../../compositeMask', () => ({
  compositeMask: (...args: unknown[]): number => calls.push('composite') && compositeMaskMock(...args),
}));
vi.mock('../getGlassCacheHit', () => ({ getGlassCacheHit: (...args: unknown[]): unknown => getGlassCacheHitMock(...args) }));
vi.mock('../getIsolatedScissorRect', () => ({ getIsolatedScissorRect: (...args: unknown[]): unknown => getIsolatedScissorRectMock(...args) }));
vi.mock('../paintBackgroundBlurShape', () => ({
  paintBackgroundBlurShape: (...args: unknown[]): number => calls.push('shape') && paintBackgroundBlurShapeMock(...args),
}));
vi.mock('../renderFreshGlassWarp', () => ({
  renderFreshGlassWarp: (...args: unknown[]): number => calls.push('warp') && renderFreshGlassWarpMock(...args),
}));
vi.mock('../renderIntoTarget', () => ({
  renderIntoTarget: (_renderer: unknown, _target: unknown, paint: () => void): void => {
    calls.push('render');
    paint();
  },
}));
vi.mock('../setScissorRect', () => ({ setScissorRect: (...args: unknown[]): number => calls.push('scissor') && setScissorRectMock(...args) }));
vi.mock('../storeGlassCacheEntry', () => ({
  storeGlassCacheEntry: (...args: unknown[]): number => calls.push('store') && storeGlassCacheEntryMock(...args),
}));

const node: TRectangleNode = {
  effects: [{ ...createEffect(EffectType.glass), frost: 4 }],
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 60,
  x: 0,
  y: 0,
};

const createRenderer = (): { pool: { acquire: ReturnType<typeof vi.fn>; release: ReturnType<typeof vi.fn> }; renderer: TMaskRenderer } => {
  const pool = {
    acquire: vi
      .fn()
      .mockReturnValueOnce({ tag: 'warped', texture: { tag: 'warped-tex' } })
      .mockReturnValueOnce({ tag: 'mask', texture: { tag: 'mask-tex' } }),
    release: vi.fn(),
  };

  return {
    pool,
    renderer: {
      context: { canvasWidth: 1000, viewport: { x: 0, y: 0, zoom: 1 } },
      gl: {
        blendFunc: vi.fn(),
        blendFuncSeparate: vi.fn(),
        drawingBufferHeight: 1000,
        drawingBufferWidth: 1000,
      },
      pool,
    } as unknown as TMaskRenderer,
  };
};

describe('applyGlassEffect', () => {
  beforeEach(() => {
    calls.length = 0;
    vi.clearAllMocks();
    getIsolatedScissorRectMock.mockReturnValue(RECT);
    getStateMock.mockReturnValue({});
    getGlassCacheHitMock.mockReturnValue(undefined);
  });

  it('should render a fresh warp, cache it, clip it to the node shape and composite it, then release both targets, on a cache miss', () => {
    // mock
    const { pool, renderer } = createRenderer();

    // action
    applyGlassEffect(renderer, node, null);

    // result
    expect(calls).toEqual(['bind', 'warp', 'store', 'render', 'shape', 'bind', 'scissor', 'composite', 'scissor']);
    expect(renderFreshGlassWarpMock).toHaveBeenCalledWith(
      renderer,
      node,
      node.effects![0],
      RECT,
      expect.any(Number),
      expect.objectContaining({ tag: 'warped' }),
    );
    expect(storeGlassCacheEntryMock).toHaveBeenCalledWith(renderer.gl, 'r1', NODES_STATE, expect.objectContaining({ tag: 'warped' }), RECT);
    expect(blitGlassCacheEntryMock).not.toHaveBeenCalled();
    expect(compositeMaskMock).toHaveBeenCalledWith(renderer.context, { tag: 'warped-tex' }, { tag: 'mask-tex' });
    expect(pool.release).toHaveBeenCalledTimes(2);
  });

  it('should blit the cached warp instead of rebuilding it, on a cache hit', () => {
    // mock
    const { renderer } = createRenderer();
    const cachedEntry = { tag: 'cached' };

    getGlassCacheHitMock.mockReturnValue(cachedEntry);

    // action
    applyGlassEffect(renderer, node, null);

    // result
    expect(calls).toEqual(['bind', 'blit', 'render', 'shape', 'bind', 'scissor', 'composite', 'scissor']);
    expect(blitGlassCacheEntryMock).toHaveBeenCalledWith(renderer.gl, cachedEntry, expect.objectContaining({ tag: 'warped' }), RECT);
    expect(renderFreshGlassWarpMock).not.toHaveBeenCalled();
    expect(storeGlassCacheEntryMock).not.toHaveBeenCalled();
  });

  it('should not look up or store a cache entry when there is no scissor rect to key it by', () => {
    // mock
    const { renderer } = createRenderer();

    getIsolatedScissorRectMock.mockReturnValue(null);

    // action
    applyGlassEffect(renderer, node, null);

    // result
    expect(getGlassCacheHitMock).not.toHaveBeenCalled();
    expect(renderFreshGlassWarpMock).toHaveBeenCalledWith(renderer, node, node.effects![0], null, expect.any(Number), expect.anything());
    expect(storeGlassCacheEntryMock).not.toHaveBeenCalled();
  });

  it('should do nothing without a glass effect', () => {
    // mock
    const { pool, renderer } = createRenderer();

    // action
    applyGlassEffect(renderer, { ...node, effects: [createEffect(EffectType.layerBlur)] }, null);

    // result
    expect(calls).toEqual([]);
    expect(pool.acquire).not.toHaveBeenCalled();
    expect(getIsolatedScissorRectMock).not.toHaveBeenCalled();
  });

  it('should skip entirely when the isolated rect is fully off screen', () => {
    // mock
    const { pool, renderer } = createRenderer();

    getIsolatedScissorRectMock.mockReturnValue({ ...RECT, offscreen: true });

    // action
    applyGlassEffect(renderer, node, null);

    // result
    expect(calls).toEqual([]);
    expect(pool.acquire).not.toHaveBeenCalled();
  });
});
