// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { disarmEqualSpacingGuides } from '../disarmEqualSpacingGuides';

describe('disarmEqualSpacingGuides', () => {
  it('should clear any equal-spacing guides left over from the gesture', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    canvasRefs.transform.equalSpacingGuidesRef.current = { labels: [], lines: [{ dashed: false, x1: 0, x2: 10, y1: 0, y2: 0 }] };

    // before
    disarmEqualSpacingGuides(canvasRefs);

    // result
    expect(canvasRefs.transform.equalSpacingGuidesRef.current).toBeNull();
  });
});
