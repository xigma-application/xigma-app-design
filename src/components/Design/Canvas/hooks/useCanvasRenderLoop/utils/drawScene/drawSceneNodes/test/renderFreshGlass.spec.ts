// types
import { EffectType, NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { renderFreshGlass } from '../renderFreshGlass';

const calls: string[] = [];
const acquireGlassBackdropMock = vi.fn();
const compositeMaskMock = vi.fn();
const isGlassRectStableMock = vi.fn();
const markGlassBackdropDirtyMock = vi.fn();
const renderFreshGlassWarpMock = vi.fn();
const storeGlassCacheEntryMock = vi.fn();

const RECT = { clipped: false, height: 80, offscreen: false, originX: 0, originY: 0, rawHeight: 80, rawWidth: 100, width: 100, x: 0, y: 0 };
const NODES_STATE = { tag: 'nodes-state' };
const BACKDROP = { tag: 'backdrop' };

vi.mock('../acquireGlassBackdrop', () => ({ acquireGlassBackdrop: (...args: unknown[]): unknown => acquireGlassBackdropMock(...args) }));
vi.mock('../bindTarget', () => ({ bindTarget: (): number => calls.push('bind') }));
vi.mock('../../compositeMask', () => ({
  compositeMask: (...args: unknown[]): number => calls.push('composite') && compositeMaskMock(...args),
}));
vi.mock('../isGlassRectStable', () => ({ isGlassRectStable: (...args: unknown[]): unknown => isGlassRectStableMock(...args) }));
vi.mock('../markGlassBackdropDirty', () => ({
  markGlassBackdropDirty: (...args: unknown[]): number => calls.push('dirty') && markGlassBackdropDirtyMock(...args),
}));
vi.mock('../paintBackgroundBlurShape', () => ({ paintBackgroundBlurShape: (): number => calls.push('shape') }));
vi.mock('../renderFreshGlassWarp', () => ({
  renderFreshGlassWarp: (...args: unknown[]): number => calls.push('warp') && renderFreshGlassWarpMock(...args),
}));
vi.mock('../renderIntoTarget', () => ({
  renderIntoTarget: (_renderer: unknown, _target: unknown, paint: () => void): void => {
    calls.push('render');
    paint();
  },
}));
vi.mock('../setScissorRect', () => ({ setScissorRect: (): number => calls.push('scissor') }));
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
      gl: { drawingBufferHeight: 1000, drawingBufferWidth: 1000 },
      pool,
    } as unknown as TMaskRenderer,
  };
};

describe('renderFreshGlass', () => {
  beforeEach(() => {
    calls.length = 0;
    vi.clearAllMocks();
    acquireGlassBackdropMock.mockReturnValue(BACKDROP);
    isGlassRectStableMock.mockReturnValue(true);
  });

  it('should render the warp, cache it, clip it to the node shape and composite it, then release both targets', () => {
    // mock
    const { pool, renderer } = createRenderer();

    // action
    renderFreshGlass(renderer, node, node.effects![0], null, RECT, NODES_STATE);

    // result
    expect(calls).toEqual([
      'bind',
      'warp',
      'render',
      'scissor',
      'shape',
      'scissor',
      'store',
      'bind',
      'scissor',
      'composite',
      'scissor',
      'dirty',
    ]);
    expect(acquireGlassBackdropMock).toHaveBeenCalledWith(renderer, RECT);
    expect(renderFreshGlassWarpMock).toHaveBeenCalledWith(
      renderer,
      node,
      node.effects![0],
      RECT,
      expect.any(Number),
      expect.objectContaining({ tag: 'warped' }),
      BACKDROP,
    );
    expect(storeGlassCacheEntryMock).toHaveBeenCalledWith(
      renderer.gl,
      'r1',
      NODES_STATE,
      expect.objectContaining({ tag: 'warped' }),
      expect.objectContaining({ tag: 'mask' }),
      RECT,
    );
    expect(compositeMaskMock).toHaveBeenCalledWith(renderer.context, { tag: 'warped-tex' }, { tag: 'mask-tex' });
    expect(markGlassBackdropDirtyMock).toHaveBeenCalledWith(renderer, RECT);
    expect(pool.release).toHaveBeenCalledTimes(2);
  });

  it('should not cache a warp whose rect is not stable yet', () => {
    // mock
    const { renderer } = createRenderer();

    isGlassRectStableMock.mockReturnValue(false);

    // action
    renderFreshGlass(renderer, node, node.effects![0], null, RECT, NODES_STATE);

    // result
    expect(renderFreshGlassWarpMock).toHaveBeenCalled();
    expect(storeGlassCacheEntryMock).not.toHaveBeenCalled();
  });

  it('should not share the canvas backdrop when rendering into an offscreen target', () => {
    // mock
    const { renderer } = createRenderer();
    const target = { tag: 'target' } as never;

    // action
    renderFreshGlass(renderer, node, node.effects![0], target, RECT, NODES_STATE);

    // result
    expect(acquireGlassBackdropMock).not.toHaveBeenCalled();
    expect(renderFreshGlassWarpMock).toHaveBeenCalledWith(
      renderer,
      node,
      node.effects![0],
      RECT,
      expect.any(Number),
      expect.anything(),
      null,
    );
  });

  it('should neither share the backdrop nor cache when there is no scissor rect', () => {
    // mock
    const { renderer } = createRenderer();

    // action
    renderFreshGlass(renderer, node, node.effects![0], null, null, NODES_STATE);

    // result
    expect(acquireGlassBackdropMock).not.toHaveBeenCalled();
    expect(isGlassRectStableMock).not.toHaveBeenCalled();
    expect(storeGlassCacheEntryMock).not.toHaveBeenCalled();
  });
});
