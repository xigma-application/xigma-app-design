// types
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { glassBackdropStates } from '../glassBackdropStates';
import { markGlassBackdropDirty } from '../markGlassBackdropDirty';

const withBackdrop = (): TMaskRenderer => {
  const renderer = {} as TMaskRenderer;
  glassBackdropStates.set(renderer, { backdrop: {} as TRenderTarget, dirty: [], fullyDirty: false, isMipmapped: false });
  return renderer;
};

describe('markGlassBackdropDirty', () => {
  it('should record a dirty rect, or the whole backdrop without one', () => {
    // mock
    const renderer = withBackdrop();
    const rect = { height: 1, width: 1, x: 0, y: 0 };

    // before
    markGlassBackdropDirty(renderer, rect);
    markGlassBackdropDirty(renderer, null);

    // result
    expect(glassBackdropStates.get(renderer)).toMatchObject({ dirty: [rect], fullyDirty: true });
  });

  it('should ignore renderers without a captured backdrop', () => {
    // mock
    const renderer = {} as TMaskRenderer;
    glassBackdropStates.set(renderer, { backdrop: null, dirty: [], fullyDirty: false, isMipmapped: false });

    // before
    markGlassBackdropDirty(renderer, null);
    markGlassBackdropDirty({} as TMaskRenderer, null);

    // result
    expect(glassBackdropStates.get(renderer)?.fullyDirty).toBe(false);
  });
});
