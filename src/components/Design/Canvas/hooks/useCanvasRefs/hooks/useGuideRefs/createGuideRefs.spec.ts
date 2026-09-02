// hooks
import { createGuideRefs } from './createGuideRefs';

describe('createGuideRefs behaviors', () => {
  it('should default the dragging guide ref to null', () => {
    // before
    const refs = createGuideRefs();

    // result
    expect(refs).toEqual({ draggingGuideRef: { current: null }, hoveredGuideRef: { current: null }, selectedGuideRef: { current: null } });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const draggingGuideRef = { current: { axis: 'x' as const, frameId: null, hasMoved: false, id: null, position: 100 } };

    // before
    const refs = createGuideRefs({ draggingGuideRef });

    // result
    expect(refs.draggingGuideRef).toBe(draggingGuideRef);
  });
});
