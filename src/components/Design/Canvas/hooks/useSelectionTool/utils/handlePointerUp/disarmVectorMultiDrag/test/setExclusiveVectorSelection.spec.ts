// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { setExclusiveVectorSelection } from '../setExclusiveVectorSelection';

describe('setExclusiveVectorSelection', () => {
  it('should set only the given vertex ids, clearing handles and segments', () => {
    // mock
    const canvasRefs = createCanvasRefs({
      selectedVectorHandlesRef: { current: [{ end: 'start', segmentId: 's1' }] },
      selectedVectorSegmentIdsRef: { current: ['s1'] },
    });

    // before
    setExclusiveVectorSelection(canvasRefs, { vertexIds: ['v1', 'v2'] });

    // result
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1', 'v2']);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should set only the given handles, clearing vertices and segments', () => {
    // mock
    const canvasRefs = createCanvasRefs({
      selectedVectorSegmentIdsRef: { current: ['s1'] },
      selectedVectorVertexIdsRef: { current: ['v1'] },
    });

    // before
    setExclusiveVectorSelection(canvasRefs, { handles: [{ end: 'end', segmentId: 's2' }] });

    // result
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'end', segmentId: 's2' }]);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should set only the given segment ids, clearing vertices and handles', () => {
    // mock
    const canvasRefs = createCanvasRefs({
      selectedVectorHandlesRef: { current: [{ end: 'start', segmentId: 's1' }] },
      selectedVectorVertexIdsRef: { current: ['v1'] },
    });

    // before
    setExclusiveVectorSelection(canvasRefs, { segmentIds: ['s2', 's3'] });

    // result
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s2', 's3']);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
  });

  it('should clear all three refs when called with nothing set', () => {
    // mock
    const canvasRefs = createCanvasRefs({
      selectedVectorHandlesRef: { current: [{ end: 'start', segmentId: 's1' }] },
      selectedVectorSegmentIdsRef: { current: ['s1'] },
      selectedVectorVertexIdsRef: { current: ['v1'] },
    });

    // before
    setExclusiveVectorSelection(canvasRefs, {});

    // result
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });
});
