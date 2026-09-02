// types
import { THoverRefs } from 'types/design/canvas/types';

export const createHoverRefs = (overrides: Partial<THoverRefs> = {}): THoverRefs => ({
  hoverRef: { current: null },
  hoveredCornerRadiusHandleRef: { current: null },
  hoveredEllipseArcHandleRef: { current: null },
  hoveredEllipseArcRatioHandleRef: { current: null },
  hoveredEllipseArcRotateHandleRef: { current: null },
  hoveredPolygonCornerRadiusHandleRef: { current: null },
  hoveredPolygonVertexCountHandleRef: { current: null },
  hoveredSegmentIdRef: { current: null },
  hoveredStarCornerRadiusHandleRef: { current: null },
  hoveredStarRatioHandleRef: { current: null },
  hoveredStarVertexCountHandleRef: { current: null },
  hoveredVectorCutPointRef: { current: null },
  hoveredVectorCutSegmentRef: { current: null },
  hoveredVectorEdgeInsertPointRef: { current: null },
  hoveredVectorFaceSelectRef: { current: null },
  hoveredVectorHandleRef: { current: null },
  hoveredVectorPaintFaceKeyRef: { current: null },
  hoveredVectorSegmentIdRef: { current: null },
  hoveredVectorShapeBuilderFaceRef: { current: null },
  hoveredVectorVertexIdRef: { current: null },
  hoveredVectorWidthLabelRef: { current: null },
  hoveredVectorWidthPointRef: { current: null },
  ...overrides,
});
