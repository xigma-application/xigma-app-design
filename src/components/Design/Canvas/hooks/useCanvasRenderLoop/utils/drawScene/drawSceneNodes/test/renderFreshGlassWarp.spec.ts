// types
import { TEffect, TSceneNode } from 'types/design/types';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { createGlProxy } from 'test/createGlProxy';
import { renderFreshGlassWarp } from '../renderFreshGlassWarp';

const blurMock = vi.fn();
const captureMock = vi.fn(() => 'captured');
const drawGlassPassMock = vi.fn();
const setScissorRectMock = vi.fn();

vi.mock('../blurIsolatedTarget', () => ({ blurIsolatedTarget: (...args: unknown[]): unknown => blurMock(...args) }));
vi.mock('../captureBackdropTexture', () => ({ captureBackdropTexture: (...args: unknown[]): unknown => captureMock(...(args as [])) }));
vi.mock('../drawGlassPass', () => ({ drawGlassPass: (...args: unknown[]): unknown => drawGlassPassMock(...args) }));
vi.mock('../setScissorRect', () => ({ setScissorRect: (...args: unknown[]): unknown => setScissorRectMock(...args) }));
vi.mock('../renderIntoTarget', () => ({ renderIntoTarget: (_renderer: unknown, _target: unknown, draw: () => void): void => draw() }));

const node = { id: 'n' } as TSceneNode;
const effect = {} as TEffect;
const warped = { id: 'warped' } as unknown as TRenderTarget;
const rect = { height: 1, width: 1, x: 0, y: 0 };

const createRenderer = (): TMaskRenderer & { pool: { release: TFunc } } =>
  ({ gl: createGlProxy(), pool: { release: vi.fn() } }) as unknown as TMaskRenderer & { pool: { release: TFunc } };

describe('renderFreshGlassWarp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should warp a freshly captured backdrop into the target, frost it and release the capture', () => {
    // mock
    const renderer = createRenderer();

    // before
    renderFreshGlassWarp(renderer, node, effect, rect, 4, warped, null);

    // result
    expect(captureMock).toHaveBeenCalledWith(renderer, rect);
    expect(renderer.gl.blendFunc).toHaveBeenCalledWith('ONE', 'ZERO');
    expect(drawGlassPassMock).toHaveBeenCalledWith(renderer, node, effect, 'captured', warped);
    expect(setScissorRectMock.mock.calls.map((call) => call[1])).toEqual([rect, null]);
    expect(renderer.gl.blendFuncSeparate).toHaveBeenCalledWith('SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA', 'ONE', 'ONE_MINUS_SRC_ALPHA');
    expect(blurMock).toHaveBeenCalledWith(renderer, warped, 4, undefined, rect);
    expect(renderer.pool.release).toHaveBeenCalledWith('captured');
  });

  it('should reuse a shared backdrop, keep it, and skip frost below the minimum radius', () => {
    // mock
    const renderer = createRenderer();
    const shared = { id: 'shared' } as unknown as TRenderTarget;

    // before
    renderFreshGlassWarp(renderer, node, effect, null, 0.5, warped, shared);

    // result
    expect(captureMock).not.toHaveBeenCalled();
    expect(drawGlassPassMock).toHaveBeenCalledWith(renderer, node, effect, shared, warped);
    expect(blurMock).not.toHaveBeenCalled();
    expect(renderer.pool.release).not.toHaveBeenCalled();
  });
});
