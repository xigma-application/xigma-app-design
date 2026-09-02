// hooks
import { createStarRatioRefs } from './createStarRatioRefs';

describe('createStarRatioRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createStarRatioRefs();

    // result
    expect(refs).toEqual({ starRatioDragRef: { current: null } });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const starRatioDragRef = { current: null };

    // before
    const refs = createStarRatioRefs({ starRatioDragRef });

    // result
    expect(refs.starRatioDragRef).toBe(starRatioDragRef);
  });
});
