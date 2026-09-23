// types
import { EffectType, NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { applyGlassEffect } from '../applyGlassEffect';
import { createEffect } from 'utils/design/effects/createEffect';

const bindTargetMock = vi.fn();
const canRenderGlassDirectlyMock = vi.fn();
const compositeGlassCacheEntryMock = vi.fn();
const getGlassCacheHitMock = vi.fn();
const getIsolatedScissorRectMock = vi.fn();
const markGlassBackdropDirtyMock = vi.fn();
const renderDirectGlassMock = vi.fn();
const renderFreshGlassMock = vi.fn();

const RECT = { clipped: false, height: 80, offscreen: false, originX: 0, originY: 0, rawHeight: 80, rawWidth: 100, width: 100, x: 0, y: 0 };
const NODES_STATE = { tag: 'nodes-state' };

vi.mock('store', () => ({ store: { getState: (): unknown => ({}) } }));
vi.mock('store/design/selectors', () => ({ selectNodes: (): unknown => NODES_STATE }));
vi.mock('../bindTarget', () => ({ bindTarget: (...args: unknown[]): unknown => bindTargetMock(...args) }));
vi.mock('../canRenderGlassDirectly', () => ({
  canRenderGlassDirectly: (...args: unknown[]): unknown => canRenderGlassDirectlyMock(...args),
}));
vi.mock('../compositeGlassCacheEntry', () => ({
  compositeGlassCacheEntry: (...args: unknown[]): unknown => compositeGlassCacheEntryMock(...args),
}));
vi.mock('../getGlassCacheHit', () => ({ getGlassCacheHit: (...args: unknown[]): unknown => getGlassCacheHitMock(...args) }));
vi.mock('../getIsolatedScissorRect', () => ({
  getIsolatedScissorRect: (...args: unknown[]): unknown => getIsolatedScissorRectMock(...args),
}));
vi.mock('../markGlassBackdropDirty', () => ({
  markGlassBackdropDirty: (...args: unknown[]): unknown => markGlassBackdropDirtyMock(...args),
}));
vi.mock('../renderDirectGlass', () => ({ renderDirectGlass: (...args: unknown[]): unknown => renderDirectGlassMock(...args) }));
vi.mock('../renderFreshGlass', () => ({ renderFreshGlass: (...args: unknown[]): unknown => renderFreshGlassMock(...args) }));

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

const renderer = { gl: { tag: 'gl' } } as unknown as TMaskRenderer;

describe('applyGlassEffect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getIsolatedScissorRectMock.mockReturnValue(RECT);
    getGlassCacheHitMock.mockReturnValue(undefined);
    canRenderGlassDirectlyMock.mockReturnValue(false);
  });

  it('should render a fresh glass on a cache miss', () => {
    // action
    applyGlassEffect(renderer, node, null);

    // result
    expect(getGlassCacheHitMock).toHaveBeenCalledWith(renderer.gl, 'r1', NODES_STATE, RECT);
    expect(bindTargetMock).toHaveBeenCalledWith(renderer, null);
    expect(renderFreshGlassMock).toHaveBeenCalledWith(renderer, node, node.effects![0], null, RECT, NODES_STATE);
    expect(compositeGlassCacheEntryMock).not.toHaveBeenCalled();
    expect(renderDirectGlassMock).not.toHaveBeenCalled();
  });

  it('should composite the cached entry and mark the backdrop dirty on a cache hit', () => {
    // mock
    const cachedEntry = { tag: 'cached' };

    getGlassCacheHitMock.mockReturnValue(cachedEntry);

    // action
    applyGlassEffect(renderer, node, null);

    // result
    expect(compositeGlassCacheEntryMock).toHaveBeenCalledWith(renderer, cachedEntry, RECT);
    expect(markGlassBackdropDirtyMock).toHaveBeenCalledWith(renderer, RECT);
    expect(renderFreshGlassMock).not.toHaveBeenCalled();
    expect(renderDirectGlassMock).not.toHaveBeenCalled();
  });

  it('should render the glass straight to the canvas when it can be drawn directly', () => {
    // mock
    canRenderGlassDirectlyMock.mockReturnValue(true);

    // action
    applyGlassEffect(renderer, node, null);

    // result
    expect(canRenderGlassDirectlyMock).toHaveBeenCalledWith(renderer, node, null, RECT);
    expect(renderDirectGlassMock).toHaveBeenCalledWith(renderer, node, node.effects![0], RECT);
    expect(renderFreshGlassMock).not.toHaveBeenCalled();
  });

  it('should not look up a cache entry or render directly when there is no scissor rect', () => {
    // mock
    getIsolatedScissorRectMock.mockReturnValue(null);

    // action
    applyGlassEffect(renderer, node, null);

    // result
    expect(getGlassCacheHitMock).not.toHaveBeenCalled();
    expect(canRenderGlassDirectlyMock).not.toHaveBeenCalled();
    expect(renderFreshGlassMock).toHaveBeenCalledWith(renderer, node, node.effects![0], null, null, NODES_STATE);
  });

  it('should do nothing without a glass effect', () => {
    // action
    applyGlassEffect(renderer, { ...node, effects: [createEffect(EffectType.layerBlur)] }, null);

    // result
    expect(getIsolatedScissorRectMock).not.toHaveBeenCalled();
    expect(bindTargetMock).not.toHaveBeenCalled();
  });

  it('should skip entirely when the isolated rect is fully off screen', () => {
    // mock
    getIsolatedScissorRectMock.mockReturnValue({ ...RECT, offscreen: true });

    // action
    applyGlassEffect(renderer, node, null);

    // result
    expect(bindTargetMock).not.toHaveBeenCalled();
    expect(renderFreshGlassMock).not.toHaveBeenCalled();
  });
});
