import {
  resolveCornerRadiusHover,
  resolveEditingTextHover,
  resolveEllipseArcHover,
  resolveLineEndpointHover,
  resolvePathOffsetHover,
  resolvePlainNodeHover,
  resolvePolygonVertexHover,
  resolveResizeHover,
  resolveRotateHover,
  resolveStarRatioHover,
  resolveStarVertexHover,
} from './hoverResolvers';

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
  resolvePlainNodeHover,
];
