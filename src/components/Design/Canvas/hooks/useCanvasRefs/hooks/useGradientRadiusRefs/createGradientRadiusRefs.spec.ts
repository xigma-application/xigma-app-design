// hooks
import { createGradientRadiusRefs } from './createGradientRadiusRefs';

describe('createGradientRadiusRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createGradientRadiusRefs();

    // result
    expect(refs).toEqual({ gradientRadiusDragRef: { current: null } });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const gradientRadiusDragRef = { current: null };

    // before
    const refs = createGradientRadiusRefs({ gradientRadiusDragRef });

    // result
    expect(refs.gradientRadiusDragRef).toBe(gradientRadiusDragRef);
  });
});
