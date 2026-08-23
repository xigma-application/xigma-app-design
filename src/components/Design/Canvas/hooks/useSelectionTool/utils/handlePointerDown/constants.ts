import { armBakeVectorRotationOnPointerDown } from './armResolvers/armBakeVectorRotationOnPointerDown';
import { armCornerRadiusOnPointerDown } from './armResolvers/armCornerRadiusOnPointerDown';
import { armEllipseArcOnPointerDown } from './armResolvers/armEllipseArcOnPointerDown';
import { armEllipseArcRatioOnPointerDown } from './armResolvers/armEllipseArcRatioOnPointerDown';
import { armEllipseArcRotateOnPointerDown } from './armResolvers/armEllipseArcRotateOnPointerDown';
import { armGroupBoundsOnPointerDown } from './armResolvers/armGroupBoundsOnPointerDown';
import { armHitOnPointerDown } from './armResolvers/armHitOnPointerDown';
import { armLineEndpointOnPointerDown } from './armResolvers/armLineEndpointOnPointerDown';
import { armMarqueeOnPointerDown } from './armResolvers/armMarqueeOnPointerDown';
import { armPathOffsetOnPointerDown } from './armResolvers/armPathOffsetOnPointerDown';
import { armPolygonCornerRadiusOnPointerDown } from './armResolvers/armPolygonCornerRadiusOnPointerDown';
import { armPolygonVertexCountOnPointerDown } from './armResolvers/armPolygonVertexCountOnPointerDown';
import { armResizeOnPointerDown } from './armResolvers/armResizeOnPointerDown';
import { armRotateOnPointerDown } from './armResolvers/armRotateOnPointerDown';
import { armSelectedTextBoundsOnPointerDown } from './armResolvers/armSelectedTextBoundsOnPointerDown';
import { armSelectedVectorBoundsOnPointerDown } from './armResolvers/armSelectedVectorBoundsOnPointerDown';
import { armStarCornerRadiusOnPointerDown } from './armResolvers/armStarCornerRadiusOnPointerDown';
import { armStarRatioOnPointerDown } from './armResolvers/armStarRatioOnPointerDown';
import { armStarVertexCountOnPointerDown } from './armResolvers/armStarVertexCountOnPointerDown';
import { armVectorBendSegmentOnPointerDown } from './armResolvers/armVectorBendSegmentOnPointerDown';
import { armVectorCornerHandleOnPointerDown } from './armResolvers/armVectorCornerHandleOnPointerDown';
import { armVectorCutOnPointerDown } from './armResolvers/armVectorCutOnPointerDown';
import { armVectorHandleOnPointerDown } from './armResolvers/armVectorHandleOnPointerDown/armVectorHandleOnPointerDown';
import { armVectorLassoOnPointerDown } from './armResolvers/armVectorLassoOnPointerDown/armVectorLassoOnPointerDown';
import { armVectorMarqueeOnPointerDown } from './armResolvers/armVectorMarqueeOnPointerDown';
import { armVectorMultiSelectBoxOnPointerDown } from './armResolvers/armVectorMultiSelectBoxOnPointerDown';
import { armVectorMultiSelectResizeOnPointerDown } from './armResolvers/armVectorMultiSelectResizeOnPointerDown';
import { armVectorMultiSelectRotateOnPointerDown } from './armResolvers/armVectorMultiSelectRotateOnPointerDown';
import { armVectorPaintOnPointerDown } from './armResolvers/armVectorPaintOnPointerDown';
import { armVectorSegmentOnPointerDown } from './armResolvers/armVectorSegmentOnPointerDown/armVectorSegmentOnPointerDown';
import { armVectorVertexOnPointerDown } from './armResolvers/armVectorVertexOnPointerDown/armVectorVertexOnPointerDown';
import { toggleSelectionOnPointerDown } from './armResolvers/toggleSelectionOnPointerDown';

export const ARM_RESOLVERS = [
  armVectorLassoOnPointerDown,
  armBakeVectorRotationOnPointerDown,
  armVectorPaintOnPointerDown,
  armVectorCutOnPointerDown,
  armVectorHandleOnPointerDown,
  armVectorCornerHandleOnPointerDown,
  armVectorBendSegmentOnPointerDown,
  armVectorMultiSelectResizeOnPointerDown,
  armVectorMultiSelectRotateOnPointerDown,
  armVectorVertexOnPointerDown,
  armVectorMultiSelectBoxOnPointerDown,
  armVectorSegmentOnPointerDown,
  armVectorMarqueeOnPointerDown,
  armPathOffsetOnPointerDown,
  armPolygonVertexCountOnPointerDown,
  armStarVertexCountOnPointerDown,
  armStarRatioOnPointerDown,
  armEllipseArcOnPointerDown,
  armEllipseArcRotateOnPointerDown,
  armEllipseArcRatioOnPointerDown,
  armResizeOnPointerDown,
  armCornerRadiusOnPointerDown,
  armPolygonCornerRadiusOnPointerDown,
  armStarCornerRadiusOnPointerDown,
  armRotateOnPointerDown,
  armLineEndpointOnPointerDown,
  toggleSelectionOnPointerDown,
  armHitOnPointerDown,
  armSelectedTextBoundsOnPointerDown,
  armSelectedVectorBoundsOnPointerDown,
  armGroupBoundsOnPointerDown,
  armMarqueeOnPointerDown,
];
