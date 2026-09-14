// hooks
import { createGradientEndpointMoveRefs } from './createGradientEndpointMoveRefs';

describe('createGradientEndpointMoveRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createGradientEndpointMoveRefs();

    // result
    expect(refs).toEqual({ gradientEndpointMoveDragRef: { current: null } });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const gradientEndpointMoveDragRef = { current: null };

    // before
    const refs = createGradientEndpointMoveRefs({ gradientEndpointMoveDragRef });

    // result
    expect(refs.gradientEndpointMoveDragRef).toBe(gradientEndpointMoveDragRef);
  });
});
