// hooks
import { createGradientStopRefs } from './createGradientStopRefs';

describe('createGradientStopRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createGradientStopRefs();

    // result
    expect(refs).toEqual({ gradientStopDragRef: { current: null } });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const gradientStopDragRef = { current: null };

    // before
    const refs = createGradientStopRefs({ gradientStopDragRef });

    // result
    expect(refs.gradientStopDragRef).toBe(gradientStopDragRef);
  });
});
