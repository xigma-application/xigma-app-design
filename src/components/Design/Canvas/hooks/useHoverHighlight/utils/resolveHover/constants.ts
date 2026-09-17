import { resolveAutoLayoutGapHover } from './hoverResolvers/resolveAutoLayoutGapHover';
import { resolveAutoLayoutPaddingHover } from './hoverResolvers/resolveAutoLayoutPaddingHover';
import { resolveCornerRadiusHover } from './hoverResolvers/resolveCornerRadiusHover';
import { resolveEditingTextHover } from './hoverResolvers/resolveEditingTextHover';
import { resolveEllipseArcHover } from './hoverResolvers/resolveEllipseArcHover';
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
import { resolvePolygonVertexHover } from './hoverResolvers/resolvePolygonVertexHover';
import { resolveResizeHover } from './hoverResolvers/resolveResizeHover';
import { resolveRotateHover } from './hoverResolvers/resolveRotateHover';
import { resolveSmartSelectionGapHover } from './hoverResolvers/resolveSmartSelectionGapHover';
import { resolveStarRatioHover } from './hoverResolvers/resolveStarRatioHover';
import { resolveStarVertexHover } from './hoverResolvers/resolveStarVertexHover';
import { resolveVectorMultiSelectResizeHover } from './hoverResolvers/resolveVectorMultiSelectResizeHover';
import { resolveVectorMultiSelectRotateHover } from './hoverResolvers/resolveVectorMultiSelectRotateHover';

export const HOVER_RESOLVERS = [
  resolveSmartSelectionGapHover,
  resolveAutoLayoutGapHover,
  resolveAutoLayoutPaddingHover,
  resolveGridTrackAffordanceHover,
  resolveGridTrackAffordanceHandleHover,
  resolveLineEndpointHover,
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
  resolveImageCropResizeHover,
  resolveImageCropRotateHover,
  resolveImageTileScaleHover,
  resolveResizeHover,
  resolveCornerRadiusHover,
  resolveRotateHover,
  resolveVectorMultiSelectResizeHover,
  resolveVectorMultiSelectRotateHover,
  resolvePlainNodeHover,
];
