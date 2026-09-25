// types
import { TEffect, TSceneNode } from 'types/design/types';
import { TMaskRenderer } from '../types';

// utils
import { glassBackdropStates } from '../glassBackdropStates';
import { renderDirectGlass } from '../renderDirectGlass';

const acquireMock = vi.fn(() => 'backdrop');
const drawGlassPassMock = vi.fn();
const ensureMipmapsMock = vi.fn();
const layerBlurRadiusMock = vi.fn();
const markDirtyMock = vi.fn();
const setScissorRectMock = vi.fn();

vi.mock('../acquireGlassBackdrop', () => ({ acquireGlassBackdrop: (...args: unknown[]): unknown => acquireMock(...(args as [])) }));
vi.mock('../drawGlassPass', () => ({ drawGlassPass: (...args: unknown[]): unknown => drawGlassPassMock(...args) }));
vi.mock('../ensureGlassBackdropMipmaps', () => ({
  ensureGlassBackdropMipmaps: (...args: unknown[]): unknown => ensureMipmapsMock(...args),
}));
vi.mock('../getLayerBlurRadius', () => ({ getLayerBlurRadius: (...args: unknown[]): unknown => layerBlurRadiusMock(...args) }));
vi.mock('../markGlassBackdropDirty', () => ({ markGlassBackdropDirty: (...args: unknown[]): unknown => markDirtyMock(...args) }));
vi.mock('../setScissorRect', () => ({ setScissorRect: (...args: unknown[]): unknown => setScissorRectMock(...args) }));
vi.mock('utils/design/effects/getEffectGlass', () => ({ getEffectGlass: (): unknown => ({ frost: 50 }) }));

const node = { id: 'n' } as TSceneNode;
const effect = {} as TEffect;
const rect = { height: 1, width: 1, x: 0, y: 0 };

const createRenderer = (): TMaskRenderer =>
  ({ context: { devicePixelHeight: 100, devicePixelWidth: 200 }, gl: 'gl' }) as unknown as TMaskRenderer;

describe('renderDirectGlass', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw the glass straight onto the canvas from a mipmapped backdrop and dirty its rect', () => {
    // mock
    const renderer = createRenderer();
    const state = { backdrop: null, dirty: [], fullyDirty: false, isMipmapped: false };
    glassBackdropStates.set(renderer, state);
    layerBlurRadiusMock.mockReturnValue(8);

    // before
    renderDirectGlass(renderer, node, effect, rect);

    // result
    expect(acquireMock).toHaveBeenCalledWith(renderer, rect, true);
    expect(ensureMipmapsMock).toHaveBeenCalledWith(renderer, state);
    expect(drawGlassPassMock).toHaveBeenCalledWith(renderer, node, effect, 'backdrop', { height: 100, width: 200 }, true, 3);
    expect(setScissorRectMock.mock.calls).toEqual([
      ['gl', rect],
      ['gl', null],
    ]);
    expect(markDirtyMock).toHaveBeenCalledWith(renderer, rect);
  });

  it('should skip mipmaps without frost or without a backdrop state', () => {
    // mock
    layerBlurRadiusMock.mockReturnValueOnce(0.5).mockReturnValueOnce(8);
    const withState = createRenderer();
    glassBackdropStates.set(withState, { backdrop: null, dirty: [], fullyDirty: false, isMipmapped: false });

    // before
    renderDirectGlass(withState, node, effect, rect);
    renderDirectGlass(createRenderer(), node, effect, rect);

    // result
    expect(ensureMipmapsMock).not.toHaveBeenCalled();
    expect(drawGlassPassMock.mock.calls[0][6]).toBe(0);
  });
});
