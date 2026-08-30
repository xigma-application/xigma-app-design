// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { disarmShapeContactGuides } from '../disarmShapeContactGuides';

describe('disarmShapeContactGuides', () => {
  it('should clear any contact guides left over from the gesture', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    canvasRefs.transform.contactGuidesRef.current = [{ x1: 0, x2: 10, y1: 0, y2: 0 }];

    // before
    disarmShapeContactGuides(canvasRefs);

    // result
    expect(canvasRefs.transform.contactGuidesRef.current).toBeNull();
  });
});
