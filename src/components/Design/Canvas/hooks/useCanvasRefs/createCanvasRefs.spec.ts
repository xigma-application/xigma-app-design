// hooks
import { createCanvasRefs } from './createCanvasRefs';

describe('createCanvasRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createCanvasRefs();

    // result
    expect(refs).toEqual({
      canvasRef: { current: null },
      cornerRadiusDragRef: { current: null },
      draftRef: { current: null },
      ellipseArcDragRef: { current: null },
      ellipseArcRatioDragRef: { current: null },
      ellipseArcRotateDragRef: { current: null },
      hoverRef: { current: null },
      marqueeRef: { current: null },
      penHoverVertexRef: { current: null },
      penPreviewRef: { current: null },
      polygonCornerRadiusDragRef: { current: null },
      selectedVectorVertexIdsRef: { current: [] },
      sliceRef: { current: null },
      starCornerRadiusDragRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const canvas = document.createElement('canvas');
    const canvasRef = { current: canvas };

    // before
    const refs = createCanvasRefs({ canvasRef });

    // result
    expect(refs.canvasRef).toBe(canvasRef);
    expect(refs.draftRef).toEqual({ current: null });
  });
});
