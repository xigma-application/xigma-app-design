import { resolveAutoLayoutGapHover } from './hoverResolvers/resolveAutoLayoutGapHover';
import { resolveAutoLayoutPaddingHover } from './hoverResolvers/resolveAutoLayoutPaddingHover';
import { resolveCornerRadiusHover } from './hoverResolvers/resolveCornerRadiusHover';
import { resolveEditingTextHover } from './hoverResolvers/resolveEditingTextHover';
import { resolveEllipseArcHover } from './hoverResolvers/resolveEllipseArcHover';
import { resolveEllipseArcRatioHover } from './hoverResolvers/resolveEllipseArcRatioHover';
import { resolveEllipseArcRotateHover } from './hoverResolvers/resolveEllipseArcRotateHover';
import { resolveGradientEndpointMoveHover } from './hoverResolvers/resolveGradientEndpointMoveHover';
import { resolveGradientLineHover } from './hoverResolvers/resolveGradientLineHover';
import { resolveGradientRadiusHover } from './hoverResolvers/resolveGradientRadiusHover';
import { resolveGradientRotateHover } from './hoverResolvers/resolveGradientRotateHover';
import { resolveGradientStopHover } from './hoverResolvers/resolveGradientStopHover';
import { resolveGridTrackAffordanceHandleHover } from './hoverResolvers/resolveGridTrackAffordanceHandleHover';
import { resolveGridTrackAffordanceHover } from './hoverResolvers/resolveGridTrackAffordanceHover';
import { resolveImageCropResizeHover } from './hoverResolvers/resolveImageCropResizeHover';
import { resolveImageCropRotateHover } from './hoverResolvers/resolveImageCropRotateHover';
import { resolveImageTileScaleHover } from './hoverResolvers/resolveImageTileScaleHover';
import { resolveLineEndpointHover } from './hoverResolvers/resolveLineEndpointHover';
import { resolvePathOffsetHover } from './hoverResolvers/resolvePathOffsetHover';
import { resolvePlainNodeHover } from './hoverResolvers/resolvePlainNodeHover';
import { resolvePolygonCornerRadiusHover } from './hoverResolvers/resolvePolygonCornerRadiusHover';
import { resolvePolygonVertexHover } from './hoverResolvers/resolvePolygonVertexHover';
import { resolveProgressiveBlurHover } from './hoverResolvers/resolveProgressiveBlurHover';
import { resolveResizeHover } from './hoverResolvers/resolveResizeHover';
import { resolveRotateHover } from './hoverResolvers/resolveRotateHover';
import { resolveSmartSelectionGapHover } from './hoverResolvers/resolveSmartSelectionGapHover';
import { resolveStarCornerRadiusHover } from './hoverResolvers/resolveStarCornerRadiusHover';
import { resolveStarRatioHover } from './hoverResolvers/resolveStarRatioHover';
import { resolveStarVertexHover } from './hoverResolvers/resolveStarVertexHover';
import { resolveVectorMultiSelectResizeHover } from './hoverResolvers/resolveVectorMultiSelectResizeHover';
import { resolveVectorMultiSelectRotateHover } from './hoverResolvers/resolveVectorMultiSelectRotateHover';

export const HANDLE_HOVER_RESOLVERS = [
  resolveEllipseArcHover,
  resolveEllipseArcRotateHover,
  resolveEllipseArcRatioHover,
  resolveProgressiveBlurHover,
  resolveGradientStopHover,
  resolveGradientEndpointMoveHover,
  resolveGradientRadiusHover,
  resolveGradientRotateHover,
  resolveGradientLineHover,
  resolveCornerRadiusHover,
  resolvePolygonCornerRadiusHover,
  resolvePolygonVertexHover,
  resolveStarCornerRadiusHover,
  resolveStarRatioHover,
  resolveStarVertexHover,
];

export const HOVER_RESOLVERS = [
  resolveSmartSelectionGapHover,
  resolveAutoLayoutGapHover,
  resolveAutoLayoutPaddingHover,
  resolveGridTrackAffordanceHover,
  resolveGridTrackAffordanceHandleHover,
  resolveLineEndpointHover,
  resolveProgressiveBlurHover,
  resolveGradientStopHover,
  resolveGradientEndpointMoveHover,
  resolveGradientRadiusHover,
  resolveGradientRotateHover,
  resolveGradientLineHover,
  resolvePathOffsetHover,
  resolveEditingTextHover,
  resolvePolygonVertexHover,
  resolveStarVertexHover,
  resolveStarRatioHover,
  resolveEllipseArcHover,
  resolveEllipseArcRotateHover,
  resolveEllipseArcRatioHover,
  resolveImageCropResizeHover,
  resolveImageCropRotateHover,
  resolveImageTileScaleHover,
  resolveResizeHover,
  resolveCornerRadiusHover,
  resolvePolygonCornerRadiusHover,
  resolveStarCornerRadiusHover,
  resolveRotateHover,
  resolveVectorMultiSelectResizeHover,
  resolveVectorMultiSelectRotateHover,
  resolvePlainNodeHover,
];
