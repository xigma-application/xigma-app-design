// hooks
import { createEllipseArcRefs } from './createEllipseArcRefs';

describe('createEllipseArcRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createEllipseArcRefs();

    // result
    expect(refs).toEqual({
      ellipseArcDragRef: { current: null },
      ellipseArcRatioDragRef: { current: null },
      ellipseArcRotateDragRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const ellipseArcDragRef = { current: null };

    // before
    const refs = createEllipseArcRefs({ ellipseArcDragRef });

    // result
    expect(refs.ellipseArcDragRef).toBe(ellipseArcDragRef);
    expect(refs.ellipseArcRatioDragRef).toEqual({ current: null });
  });
});
