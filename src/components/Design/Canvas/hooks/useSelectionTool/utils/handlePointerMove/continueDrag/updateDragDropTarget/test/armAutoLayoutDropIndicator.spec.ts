// types
import { TAutoLayoutDropTarget } from 'store/design/utils/autoLayout/getAutoLayoutDropTarget/getAutoLayoutDropTarget';

// utils
import { armAutoLayoutDropIndicator } from '../armAutoLayoutDropIndicator';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const dropTarget: TAutoLayoutDropTarget = {
  index: 2,
  indicator: { height: 20, width: 100, x: 0, y: 40 },
  siblingPositions: { a: { x: 0, y: 0 } },
};

describe('armAutoLayoutDropIndicator', () => {
  it('should write the drop indicator, tagged with the frame id, into the hover ref', () => {
    // mock
    const refs = createCanvasRefs();

    // action
    armAutoLayoutDropIndicator(refs, 'frame-1', dropTarget);

    // result
    expect(refs.transform.autoLayoutDropTargetRef.current).toEqual({ frameId: 'frame-1', ...dropTarget });
  });

  it('should clear any in-flight reorder preview since this is a different-parent drop, not a reorder', () => {
    // mock
    const refs = createCanvasRefs({
      transform: { autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId: 'frame-1', positions: {} } } },
    });

    // action
    armAutoLayoutDropIndicator(refs, 'frame-1', dropTarget);

    // result
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toBeNull();
  });
});
