// types
import { THoverRefs, TPenRefs, TVectorEditRefs } from 'types/design/canvas/types';

// utils
import { clearVectorPenPreview } from '../clearVectorPenPreview';

describe('clearVectorPenPreview', () => {
  it('should clear the rubber-band preview, hovered segment, drag-armable flag, and alignment guide, and return null', () => {
    // mock
    const penPreviewRef: TPenRefs['penPreviewRef'] = {
      current: { from: { x: 0, y: 0 }, isSnapped: false, tangentFromOffset: null, to: { x: 1, y: 1 } },
    };
    const hoveredSegmentIdRef: THoverRefs['hoveredSegmentIdRef'] = { current: 'stale-segment' };
    const penHoveredDragArmableVertexRef: TPenRefs['penHoveredDragArmableVertexRef'] = { current: true };
    const vectorAlignmentGuideRef: TVectorEditRefs['vectorAlignmentGuideRef'] = {
      current: { horizontal: null, vertical: { anchor: { x: 0, y: 0 }, match: { x: 0, y: 0 } } },
    };

    // before
    const result = clearVectorPenPreview(penPreviewRef, hoveredSegmentIdRef, penHoveredDragArmableVertexRef, vectorAlignmentGuideRef);

    // result
    expect(result).toBeNull();
    expect(penPreviewRef.current).toBeNull();
    expect(hoveredSegmentIdRef.current).toBeNull();
    expect(penHoveredDragArmableVertexRef.current).toBe(false);
    expect(vectorAlignmentGuideRef.current).toBeNull();
  });
});
