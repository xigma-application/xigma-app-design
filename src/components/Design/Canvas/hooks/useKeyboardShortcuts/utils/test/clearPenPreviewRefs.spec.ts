// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { clearPenPreviewRefs } from '../clearPenPreviewRefs';

describe('clearPenPreviewRefs', () => {
  it('should null/reset every staged pen-preview ref', () => {
    // mock
    const refs = createCanvasRefs();

    refs.penPreviewRef.current = { from: { x: 0, y: 0 }, isSnapped: false, tangentFromOffset: { x: 10, y: 10 }, to: { x: 20, y: 20 } };
    refs.penNewVertexPreviewRef.current = { x: 20, y: 20 };
    refs.penDragOriginRef.current = { nodeId: 'node-1', segmentId: null, vertexId: 'vertex-1' };
    refs.penDraggedHandlePositionRef.current = { x: 10, y: 10 };
    refs.penDraggedHandleIsSnappedRef.current = true;
    refs.vectorAlignmentGuideRef.current = { horizontal: null, vertical: null };

    // action
    clearPenPreviewRefs(refs);

    // result
    expect(refs.penPreviewRef.current).toBeNull();
    expect(refs.penNewVertexPreviewRef.current).toBeNull();
    expect(refs.penDragOriginRef.current).toBeNull();
    expect(refs.penDraggedHandlePositionRef.current).toBeNull();
    expect(refs.penDraggedHandleIsSnappedRef.current).toBe(false);
    expect(refs.vectorAlignmentGuideRef.current).toBeNull();
  });
});
