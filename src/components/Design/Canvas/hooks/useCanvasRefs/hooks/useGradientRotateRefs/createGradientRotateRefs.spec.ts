// hooks
import { createGradientRotateRefs } from './createGradientRotateRefs';

describe('createGradientRotateRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createGradientRotateRefs();

    // result
    expect(refs).toEqual({ gradientRotateDragRef: { current: null } });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const gradientRotateDragRef = { current: null };

    // before
    const refs = createGradientRotateRefs({ gradientRotateDragRef });

    // result
    expect(refs.gradientRotateDragRef).toBe(gradientRotateDragRef);
  });
});
