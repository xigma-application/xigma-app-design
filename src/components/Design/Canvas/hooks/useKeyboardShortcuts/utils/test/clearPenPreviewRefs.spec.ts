// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { clearPenPreviewRefs } from '../clearPenPreviewRefs';

describe('clearPenPreviewRefs', () => {
  it('should null/reset every staged pen-preview ref', () => {
    // mock
    const refs = createCanvasRefs();

    refs.pen.penPreviewRef.current = { from: { x: 0, y: 0 }, isSnapped: false, tangentFromOffset: { x: 10, y: 10 }, to: { x: 20, y: 20 } };
    refs.pen.penNewVertexPreviewRef.current = { x: 20, y: 20 };
    refs.pen.penDragOriginRef.current = { nodeId: 'node-1', segmentId: null, vertexId: 'vertex-1' };
    refs.pen.penDraggedHandlePositionRef.current = { x: 10, y: 10 };
    refs.pen.penDraggedHandleIsSnappedRef.current = true;
    refs.vectorEdit.vectorAlignmentGuideRef.current = { horizontal: null, vertical: null };

    // action
    clearPenPreviewRefs(refs);

    // result
    expect(refs.pen.penPreviewRef.current).toBeNull();
    expect(refs.pen.penNewVertexPreviewRef.current).toBeNull();
    expect(refs.pen.penDragOriginRef.current).toBeNull();
    expect(refs.pen.penDraggedHandlePositionRef.current).toBeNull();
    expect(refs.pen.penDraggedHandleIsSnappedRef.current).toBe(false);
    expect(refs.vectorEdit.vectorAlignmentGuideRef.current).toBeNull();
  });
});
