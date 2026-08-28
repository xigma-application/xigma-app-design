// hooks
import { createLassoMarqueeRefs } from './createLassoMarqueeRefs';

describe('createLassoMarqueeRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createLassoMarqueeRefs();

    // result
    expect(refs).toEqual({
      marqueeRef: { current: null },
      vectorLassoPathRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const marqueeRef = { current: { height: 10, rotation: 0, width: 10, x: 0, y: 0 } };

    // before
    const refs = createLassoMarqueeRefs({ marqueeRef });

    // result
    expect(refs.marqueeRef).toBe(marqueeRef);
    expect(refs.vectorLassoPathRef).toEqual({ current: null });
  });
});
