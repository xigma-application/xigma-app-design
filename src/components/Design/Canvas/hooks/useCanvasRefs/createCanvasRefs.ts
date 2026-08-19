// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const createCanvasRefs = (overrides: Partial<TCanvasRefs> = {}): TCanvasRefs => ({
  canvasRef: { current: null },
  cornerRadiusDragRef: { current: null },
  draftRef: { current: null },
  ellipseArcDragRef: { current: null },
  ellipseArcRatioDragRef: { current: null },
  ellipseArcRotateDragRef: { current: null },
  hoverRef: { current: null },
  hoveredSegmentIdRef: { current: null },
  hoveredVectorHandleRef: { current: null },
  hoveredVectorVertexIdRef: { current: null },
  marqueeRef: { current: null },
  penDraggedHandlePositionRef: { current: null },
  penNewVertexPreviewRef: { current: null },
  penPreviewRef: { current: null },
  polygonCornerRadiusDragRef: { current: null },
  rotateDragRef: { current: null },
  selectedVectorHandleRef: { current: null },
  selectedVectorVertexIdsRef: { current: [] },
  sliceRef: { current: null },
  starCornerRadiusDragRef: { current: null },
  ...overrides,
});
