// hooks
import { createCornerRadiusRefs } from './hooks/useCornerRadiusRefs/createCornerRadiusRefs';
import { createEllipseArcRefs } from './hooks/useEllipseArcRefs/createEllipseArcRefs';
import { createFrameNameRefs } from './hooks/useFrameNameRefs/createFrameNameRefs';
import { createHoverRefs } from './hooks/useHoverRefs/createHoverRefs';
import { createLassoMarqueeRefs } from './hooks/useLassoMarqueeRefs/createLassoMarqueeRefs';
import { createPenRefs } from './hooks/usePenRefs/createPenRefs';
import { createPencilRefs } from './hooks/usePencilRefs/createPencilRefs';
import { createSectionNameRefs } from './hooks/useSectionNameRefs/createSectionNameRefs';
import { createShapeBuilderRefs } from './hooks/useShapeBuilderRefs/createShapeBuilderRefs';
import { createSliceRefs } from './hooks/useSliceRefs/createSliceRefs';
import { createStarRatioRefs } from './hooks/useStarRatioRefs/createStarRatioRefs';
import { createTransformRefs } from './hooks/useTransformRefs/createTransformRefs';
import { createVectorCutRefs } from './hooks/useVectorCutRefs/createVectorCutRefs';
import { createVectorEditRefs } from './hooks/useVectorEditRefs/createVectorEditRefs';
import { createVectorEraseRefs } from './hooks/useVectorEraseRefs/createVectorEraseRefs';
import { createVectorMultiSelectRefs } from './hooks/useVectorMultiSelectRefs/createVectorMultiSelectRefs';
import { createVectorPaintRefs } from './hooks/useVectorPaintRefs/createVectorPaintRefs';
import { createVectorSnapshotsRefs } from './hooks/useVectorSnapshotsRefs/createVectorSnapshotsRefs';
import { createVectorWidthRefs } from './hooks/useVectorWidthRefs/createVectorWidthRefs';
import { createVertexCountRefs } from './hooks/useVertexCountRefs/createVertexCountRefs';

// types
import { TCanvasRefs, TCanvasRefsOverrides } from 'types/design/canvas/types';

export const createCanvasRefs = (overrides: TCanvasRefsOverrides = {}): TCanvasRefs => ({
  canvasRef: { current: null },
  colorSampleRequestRef: { current: null },
  draftRef: { current: null },
  ...overrides,
  cornerRadius: createCornerRadiusRefs(overrides.cornerRadius),
  ellipseArc: createEllipseArcRefs(overrides.ellipseArc),
  frameName: createFrameNameRefs(overrides.frameName),
  hover: createHoverRefs(overrides.hover),
  lassoMarquee: createLassoMarqueeRefs(overrides.lassoMarquee),
  pen: createPenRefs(overrides.pen),
  pencil: createPencilRefs(overrides.pencil),
  sectionName: createSectionNameRefs(overrides.sectionName),
  shapeBuilder: createShapeBuilderRefs(overrides.shapeBuilder),
  slice: createSliceRefs(overrides.slice),
  starRatio: createStarRatioRefs(overrides.starRatio),
  transform: createTransformRefs(overrides.transform),
  vectorCut: createVectorCutRefs(overrides.vectorCut),
  vectorEdit: createVectorEditRefs(overrides.vectorEdit),
  vectorErase: createVectorEraseRefs(overrides.vectorErase),
  vectorMultiSelect: createVectorMultiSelectRefs(overrides.vectorMultiSelect),
  vectorPaint: createVectorPaintRefs(overrides.vectorPaint),
  vectorSnapshots: createVectorSnapshotsRefs(overrides.vectorSnapshots),
  vectorWidth: createVectorWidthRefs(overrides.vectorWidth),
  vertexCount: createVertexCountRefs(overrides.vertexCount),
});
