// utils
import { armDragSnapGuides } from '../armDragSnapGuides';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const GUIDE = { lines: [], points: [] } as never;
const EQUAL_SPACING_GUIDES = { gaps: [] } as never;
const MATCHED_PAIR_GUIDES = { labels: [], lines: [], markers: [] };

describe('armDragSnapGuides', () => {
  it('should arm all three guide refs when nothing suppresses them', () => {
    const canvasRefs = createCanvasRefs();

    armDragSnapGuides(canvasRefs, false, null, GUIDE, EQUAL_SPACING_GUIDES, null);

    expect(canvasRefs.transform.alignmentGuideRef.current).toBe(GUIDE);
    expect(canvasRefs.transform.equalSpacingGuidesRef.current).toBe(EQUAL_SPACING_GUIDES);
    expect(canvasRefs.transform.matchedPairGuidesRef.current).toBeNull();
  });

  it('should clear every guide ref while an auto-layout drop target is active', () => {
    const canvasRefs = createCanvasRefs();

    armDragSnapGuides(canvasRefs, true, null, GUIDE, EQUAL_SPACING_GUIDES, MATCHED_PAIR_GUIDES);

    expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
    expect(canvasRefs.transform.equalSpacingGuidesRef.current).toBeNull();
    expect(canvasRefs.transform.matchedPairGuidesRef.current).toBeNull();
  });

  it('should clear every guide ref while an axis lock is engaged', () => {
    const canvasRefs = createCanvasRefs();

    armDragSnapGuides(canvasRefs, false, 'x', GUIDE, EQUAL_SPACING_GUIDES, MATCHED_PAIR_GUIDES);

    expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
    expect(canvasRefs.transform.equalSpacingGuidesRef.current).toBeNull();
    expect(canvasRefs.transform.matchedPairGuidesRef.current).toBeNull();
  });

  it('should let a matched-pair guide win over the alignment and equal-spacing guides, without axis lock or an auto-layout target', () => {
    const canvasRefs = createCanvasRefs();

    armDragSnapGuides(canvasRefs, false, null, GUIDE, EQUAL_SPACING_GUIDES, MATCHED_PAIR_GUIDES);

    expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
    expect(canvasRefs.transform.equalSpacingGuidesRef.current).toBeNull();
    expect(canvasRefs.transform.matchedPairGuidesRef.current).toBe(MATCHED_PAIR_GUIDES);
  });
});
