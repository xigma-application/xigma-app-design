// hooks
import { createSmartSelectionRefs } from './createSmartSelectionRefs';

describe('createSmartSelectionRefs behaviors', () => {
  it('should default the gap drag ref to null', () => {
    // before
    const refs = createSmartSelectionRefs();

    // result
    expect(refs).toEqual({ gapDragRef: { current: null } });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const gapDragRef = {
      current: {
        anchorPosition: 0,
        anchorSize: 50,
        axis: 'x' as const,
        badgeAnchor: { x: 0, y: 0 },
        cascadeGroups: [],
        currentGapValue: 50,
        dispatchThrottle: { frameId: null, run: null },
        hasMoved: false,
        nodeOrigins: {},
        originalGapValue: 50,
        pointerStart: { x: 0, y: 0 },
      },
    };

    // before
    const refs = createSmartSelectionRefs({ gapDragRef });

    // result
    expect(refs.gapDragRef).toBe(gapDragRef);
  });
});
