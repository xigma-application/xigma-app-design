// hooks
import { createProgressiveBlurRefs } from './createProgressiveBlurRefs';

describe('createProgressiveBlurRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createProgressiveBlurRefs();

    // result
    expect(refs).toEqual({ dragRef: { current: null }, hoveredEndpointRef: { current: null } });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const hoveredEndpointRef = { current: 'start' as const };

    // before
    const refs = createProgressiveBlurRefs({ hoveredEndpointRef });

    // result
    expect(refs.hoveredEndpointRef).toBe(hoveredEndpointRef);
  });
});
