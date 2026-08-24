// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getVectorSelectionSnapshot } from '../getVectorSelectionSnapshot';

describe('getVectorSelectionSnapshot', () => {
  it('should read the current value of all three vector-selection refs', () => {
    // mock
    const refs = createCanvasRefs({
      selectedVectorHandlesRef: { current: [{ end: 'start', segmentId: 's1' }] },
      selectedVectorSegmentIdsRef: { current: ['s1'] },
      selectedVectorVertexIdsRef: { current: ['v1', 'v2'] },
    });

    // action
    const snapshot = getVectorSelectionSnapshot(refs);

    // result
    expect(snapshot).toEqual({
      selectedVectorHandles: [{ end: 'start', segmentId: 's1' }],
      selectedVectorSegmentIds: ['s1'],
      selectedVectorVertexIds: ['v1', 'v2'],
    });
  });

  it('should not alias the live ref arrays, so later mutation of the ref does not affect the snapshot', () => {
    // mock
    const refs = createCanvasRefs({ selectedVectorVertexIdsRef: { current: ['v1'] } });

    // action
    const snapshot = getVectorSelectionSnapshot(refs);

    refs.selectedVectorVertexIdsRef.current.push('v2');

    // result
    expect(snapshot.selectedVectorVertexIds).toEqual(['v1']);
  });
});
