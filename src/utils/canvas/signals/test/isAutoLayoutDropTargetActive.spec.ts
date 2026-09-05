// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { isAutoLayoutDropTargetActive } from '../isAutoLayoutDropTargetActive';

describe('isAutoLayoutDropTargetActive', () => {
  it('should return false when neither the reorder preview nor the drop target ref is armed', () => {
    const canvasRefs = createCanvasRefs();

    expect(isAutoLayoutDropTargetActive(canvasRefs)).toBe(false);
  });

  it('should return true when the reorder preview ref is armed', () => {
    const canvasRefs = createCanvasRefs();

    canvasRefs.transform.autoLayoutReorderPreviewRef.current = { activeIndex: 0, frameId: 'frame-1', positions: {} };

    expect(isAutoLayoutDropTargetActive(canvasRefs)).toBe(true);
  });

  it('should return true when the drop target ref is armed', () => {
    const canvasRefs = createCanvasRefs();

    canvasRefs.transform.autoLayoutDropTargetRef.current = {
      frameId: 'frame-1',
      index: 0,
      indicator: { height: 3, width: 30, x: 0, y: 0 },
      siblingPositions: {},
    };

    expect(isAutoLayoutDropTargetActive(canvasRefs)).toBe(true);
  });
});
