// utils
import { applyVectorSelectionSnapshot } from '../applyVectorSelectionSnapshot';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

describe('applyVectorSelectionSnapshot', () => {
  it('should write all three fields of the snapshot onto their matching refs', () => {
    // mock
    const refs = createCanvasRefs();
    const snapshot = {
      selectedVectorHandles: [{ end: 'end' as const, segmentId: 's1' }],
      selectedVectorSegmentIds: ['s1'],
      selectedVectorVertexIds: ['v1', 'v2'],
    };

    // action
    applyVectorSelectionSnapshot(refs, snapshot);

    // result
    expect(refs.selectedVectorHandlesRef.current).toEqual([{ end: 'end', segmentId: 's1' }]);
    expect(refs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(refs.selectedVectorVertexIdsRef.current).toEqual(['v1', 'v2']);
  });
});
