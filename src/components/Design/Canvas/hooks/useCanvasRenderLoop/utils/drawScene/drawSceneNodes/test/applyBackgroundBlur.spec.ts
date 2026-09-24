// types
import { EffectType, NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { applyBackgroundBlur } from '../applyBackgroundBlur';
import { createEffect } from 'utils/design/effects/createEffect';

const calls: string[] = [];
const bindTargetMock = vi.fn();
const blurIsolatedTargetMock = vi.fn();
const compositeMaskMock = vi.fn();
const paintBackgroundBlurShapeMock = vi.fn();
const setScissorRectMock = vi.fn();
const getGlassCacheHitMock = vi.fn();
const getStretchableGlassCacheEntryMock = vi.fn();
const isBlurZoomChangingMock = vi.fn();
const refreshGlassCacheEntryMock = vi.fn();
const isGlassRectStableMock = vi.fn();
const storeGlassCacheEntryMock = vi.fn();
const compositeGlassCacheEntryMock = vi.fn();
const captureBackdropTextureMock = vi.fn(() => ({ tag: 'backdrop', texture: { tag: 'backdrop-tex' } }));

vi.mock('store', () => ({ store: { getState: (): unknown => ({}) } }));
vi.mock('store/design/selectors', () => ({ selectNodes: (): unknown => NODES_STATE }));
vi.mock('../getStretchableGlassCacheEntry', () => ({
  getStretchableGlassCacheEntry: (...args: unknown[]): unknown => getStretchableGlassCacheEntryMock(...args),
}));
vi.mock('../isBlurZoomChanging', () => ({ isBlurZoomChanging: (...args: unknown[]): unknown => isBlurZoomChangingMock(...args) }));
vi.mock('../getGlassCacheHit', () => ({ getGlassCacheHit: (...args: unknown[]): unknown => getGlassCacheHitMock(...args) }));
vi.mock('../refreshGlassCacheEntry', () => ({
  refreshGlassCacheEntry: (...args: unknown[]): unknown => refreshGlassCacheEntryMock(...args),
}));
vi.mock('../isGlassRectStable', () => ({ isGlassRectStable: (...args: unknown[]): unknown => isGlassRectStableMock(...args) }));
vi.mock('../storeGlassCacheEntry', () => ({
  storeGlassCacheEntry: (...args: unknown[]): number => calls.push('store') && storeGlassCacheEntryMock(...args),
}));
vi.mock('../compositeGlassCacheEntry', () => ({
  compositeGlassCacheEntry: (...args: unknown[]): number => calls.push('cached-composite') && compositeGlassCacheEntryMock(...args),
}));
vi.mock('../bindTarget', () => ({ bindTarget: (...args: unknown[]): number => calls.push('bind') && bindTargetMock(...args) }));
vi.mock('../captureBackdropTexture', () => ({
  captureBackdropTexture: (...args: unknown[]): unknown => captureBackdropTextureMock(...(args as [])),
}));
vi.mock('../setScissorRect', () => ({
  setScissorRect: (...args: unknown[]): number => calls.push(args[1] ? 'scissor-on' : 'scissor-off') && setScissorRectMock(...args),
}));
vi.mock('../blurIsolatedTarget', () => ({
  blurIsolatedTarget: (...args: unknown[]): number => calls.push('blur') && blurIsolatedTargetMock(...args),
}));
vi.mock('../../compositeMask', () => ({
  compositeMask: (...args: unknown[]): number => calls.push('composite') && compositeMaskMock(...args),
}));
vi.mock('../paintBackgroundBlurShape', () => ({
  paintBackgroundBlurShape: (...args: unknown[]): number => calls.push('shape') && paintBackgroundBlurShapeMock(...args),
}));
vi.mock('../renderIntoTarget', () => ({
  renderIntoTarget: (_renderer: unknown, _target: unknown, paint: () => void, clearRect: unknown): void => {
    calls.push(clearRect ? 'render' : 'render-full');
    paint();
  },
}));

const NODES_STATE = { tag: 'nodes-state' };

const node: TRectangleNode = {
  effects: [{ ...createEffect(EffectType.backgroundBlur), blur: 4 }],
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
  const pool = { acquire: vi.fn(() => ({ tag: 'mask', texture: { tag: 'mask-tex' } })), release: vi.fn() };

  return {
    pool,
    renderer: {
      context: { canvasWidth: 1000, viewport: { x: 0, y: 0, zoom: 1 } },
      gl: { drawingBufferHeight: 1000, drawingBufferWidth: 1000 },
      pool,
    } as unknown as TMaskRenderer,
  };
};

describe('applyBackgroundBlur', () => {
  beforeEach(() => {
    calls.length = 0;
    vi.clearAllMocks();
    getGlassCacheHitMock.mockReturnValue(undefined);
    getStretchableGlassCacheEntryMock.mockReturnValue(undefined);
    isBlurZoomChangingMock.mockReturnValue(false);
    isGlassRectStableMock.mockReturnValue(false);
  });

  it('should blur a copy of what is already drawn, clip it to the node shape and composite it inside the node area, then release both targets', () => {
    // mock
    const { pool, renderer } = createRenderer();

    // action
    applyBackgroundBlur(renderer, node, null);

    // result
    expect(calls).toEqual(['bind', 'blur', 'render', 'shape', 'bind', 'scissor-on', 'composite', 'scissor-off']);
    expect(captureBackdropTextureMock).toHaveBeenCalledWith(renderer, expect.objectContaining({ height: 52, width: 72 }));
    expect(blurIsolatedTargetMock).toHaveBeenCalledWith(
      renderer,
      expect.objectContaining({ tag: 'backdrop' }),
      4,
      undefined,
      expect.objectContaining({ height: 52, width: 72 }),
    );
    expect(compositeMaskMock).toHaveBeenCalledWith(renderer.context, { tag: 'backdrop-tex' }, { tag: 'mask-tex' });
    expect(pool.release).toHaveBeenCalledTimes(2);
  });

  it('should remember the blurred backdrop and the shape mask once the rect has been stable', () => {
    // mock
    const { renderer } = createRenderer();

    isGlassRectStableMock.mockReturnValue(true);

    // action
    applyBackgroundBlur(renderer, node, null);

    // result
    expect(calls).toEqual(['bind', 'blur', 'render', 'shape', 'store', 'bind', 'scissor-on', 'composite', 'scissor-off']);
    expect(refreshGlassCacheEntryMock).toHaveBeenCalledWith(renderer, 'r1', NODES_STATE, expect.any(Object), 'r1:backgroundBlur');
    expect(storeGlassCacheEntryMock).toHaveBeenCalledWith(
      renderer.gl,
      'r1:backgroundBlur',
      NODES_STATE,
      expect.objectContaining({ tag: 'backdrop' }),
      expect.objectContaining({ tag: 'mask' }),
      expect.any(Object),
    );
  });

  it('should composite the cached blur without capturing or blurring anything again', () => {
    // mock
    const { pool, renderer } = createRenderer();
    const entry = { tag: 'entry' };

    getGlassCacheHitMock.mockReturnValue(entry);

    // action
    applyBackgroundBlur(renderer, node, null);

    // result
    expect(calls).toEqual(['bind', 'cached-composite']);
    expect(compositeGlassCacheEntryMock).toHaveBeenCalledWith(renderer, entry, expect.any(Object));
    expect(captureBackdropTextureMock).not.toHaveBeenCalled();
    expect(pool.acquire).not.toHaveBeenCalled();
  });

  it('should stretch the last cached blur while the zoom is changing instead of blurring again', () => {
    // mock
    const { renderer } = createRenderer();
    const entry = { tag: 'stretched' };

    isBlurZoomChangingMock.mockReturnValue(true);
    getStretchableGlassCacheEntryMock.mockReturnValue(entry);

    // action
    applyBackgroundBlur(renderer, node, null);

    // result
    expect(calls).toEqual(['bind', 'cached-composite']);
    expect(compositeGlassCacheEntryMock).toHaveBeenCalledWith(renderer, entry, expect.any(Object));
    expect(captureBackdropTextureMock).not.toHaveBeenCalled();
  });

  it('should blur again while the zoom is changing when there is nothing to stretch', () => {
    // mock
    const { renderer } = createRenderer();

    isBlurZoomChangingMock.mockReturnValue(true);

    // action
    applyBackgroundBlur(renderer, node, null);

    // result
    expect(calls).toContain('blur');
  });

  it('should not stretch anything once the zoom has settled', () => {
    // mock
    const { renderer } = createRenderer();

    getStretchableGlassCacheEntryMock.mockReturnValue({ tag: 'stale' });

    // action
    applyBackgroundBlur(renderer, node, null);

    // result
    expect(getStretchableGlassCacheEntryMock).not.toHaveBeenCalled();
    expect(calls).toContain('blur');
  });

  it('should skip a background blur that is entirely off screen', () => {
    // mock
    const { pool, renderer } = createRenderer();

    // action
    applyBackgroundBlur(renderer, { ...node, x: 5000 }, null);

    // result
    expect(calls).toEqual([]);
    expect(pool.acquire).not.toHaveBeenCalled();
  });

  it('should do nothing without a background blur', () => {
    // mock
    const { pool, renderer } = createRenderer();

    // action
    applyBackgroundBlur(renderer, { ...node, effects: [createEffect(EffectType.layerBlur)] }, null);
    applyBackgroundBlur(renderer, { ...node, effects: [{ ...createEffect(EffectType.backgroundBlur), blur: 0 }] }, null);

    // result
    expect(calls).toEqual([]);
    expect(pool.acquire).not.toHaveBeenCalled();
  });
});
