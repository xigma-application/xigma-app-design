// types
import { TGlassBackdropState } from '../glassBackdropStates';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { createGlProxy } from 'test/createGlProxy';
import { releaseGlassBackdropTarget } from '../releaseGlassBackdropTarget';

const createRenderer = (): TMaskRenderer & { pool: { release: TFunc } } =>
  ({ gl: createGlProxy(), pool: { release: vi.fn() } }) as unknown as TMaskRenderer & { pool: { release: TFunc } };

describe('releaseGlassBackdropTarget', () => {
  it('should reset the mipmap filter of a mipmapped backdrop and return it to the pool', () => {
    // mock
    const renderer = createRenderer();
    const backdrop = { texture: 'tex' } as unknown as TRenderTarget;
    const state: TGlassBackdropState = { backdrop, dirty: [], fullyDirty: false, isMipmapped: true };

    // before
    releaseGlassBackdropTarget(renderer, state);

    // result
    expect(renderer.gl.texParameteri).toHaveBeenCalledWith('TEXTURE_2D', 'TEXTURE_MIN_FILTER', 'LINEAR');
    expect(renderer.pool.release).toHaveBeenCalledWith(backdrop);
    expect(state.isMipmapped).toBe(false);
  });

  it('should return a plain backdrop without touching its filter, and handle no backdrop', () => {
    // mock
    const renderer = createRenderer();

    // before
    releaseGlassBackdropTarget(renderer, { backdrop: {} as TRenderTarget, dirty: [], fullyDirty: false, isMipmapped: false });
    releaseGlassBackdropTarget(renderer, { backdrop: null, dirty: [], fullyDirty: false, isMipmapped: false });

    // result
    expect(renderer.gl.texParameteri).not.toHaveBeenCalled();
    expect(renderer.pool.release).toHaveBeenCalledTimes(1);
  });
});
