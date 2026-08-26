// utils
import { applyVectorMarqueeSelection } from '../applyVectorMarqueeSelection';
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';

// types
import { TVectorHandleHover } from 'types/design/canvas/types';

const handleHit: TVectorHandleHover = { end: 'start', segmentId: 's1' };

describe('applyVectorMarqueeSelection', () => {
  it('should select only the handle hits when mode is "handles"', () => {
    const canvasRefs = createCanvasRefs();

    applyVectorMarqueeSelection(canvasRefs, 'handles', ['v1'], [handleHit], ['s1']);

    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([handleHit]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should select only the vertex ids when mode is "points"', () => {
    const canvasRefs = createCanvasRefs();

    applyVectorMarqueeSelection(canvasRefs, 'points', ['v1'], [handleHit], ['s1']);

    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1']);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should select only the segment hits when mode is "everything"', () => {
    const canvasRefs = createCanvasRefs();

    applyVectorMarqueeSelection(canvasRefs, 'everything', ['v1'], [handleHit], ['s1']);

    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
  });

  it('should clear every selection list when mode is null', () => {
    const canvasRefs = createCanvasRefs({
      selectedVectorHandlesRef: { current: [handleHit] },
      selectedVectorSegmentIdsRef: { current: ['s1'] },
      selectedVectorVertexIdsRef: { current: ['v1'] },
    });

    applyVectorMarqueeSelection(canvasRefs, null, ['v1'], [handleHit], ['s1']);

    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });
});
