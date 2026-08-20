import { resolveCornerRadiusHover } from './hoverResolvers/resolveCornerRadiusHover';
import { resolveEditingTextHover } from './hoverResolvers/resolveEditingTextHover';
import { resolveEllipseArcHover } from './hoverResolvers/resolveEllipseArcHover';
import { resolveLineEndpointHover } from './hoverResolvers/resolveLineEndpointHover';
import { resolvePathOffsetHover } from './hoverResolvers/resolvePathOffsetHover';
import { resolvePlainNodeHover } from './hoverResolvers/resolvePlainNodeHover';
import { resolvePolygonVertexHover } from './hoverResolvers/resolvePolygonVertexHover';
import { resolveResizeHover } from './hoverResolvers/resolveResizeHover';
import { resolveRotateHover } from './hoverResolvers/resolveRotateHover';
import { resolveStarRatioHover } from './hoverResolvers/resolveStarRatioHover';
import { resolveStarVertexHover } from './hoverResolvers/resolveStarVertexHover';
import { resolveVectorMultiSelectResizeHover } from './hoverResolvers/resolveVectorMultiSelectResizeHover';
import { resolveVectorMultiSelectRotateHover } from './hoverResolvers/resolveVectorMultiSelectRotateHover';

export const HOVER_RESOLVERS = [
  resolveLineEndpointHover,
  resolvePathOffsetHover,
  resolveEditingTextHover,
  resolvePolygonVertexHover,
  resolveStarVertexHover,
  resolveStarRatioHover,
  resolveEllipseArcHover,
  resolveResizeHover,
  resolveCornerRadiusHover,
  resolveRotateHover,
  resolveVectorMultiSelectResizeHover,
  resolveVectorMultiSelectRotateHover,
  resolvePlainNodeHover,
];
