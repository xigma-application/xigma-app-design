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
  resolveStarVertexHover,
} from './hoverResolvers';

export const HOVER_RESOLVERS = [
  resolveLineEndpointHover,
  resolvePathOffsetHover,
  resolveEditingTextHover,
  resolvePolygonVertexHover,
  resolveStarVertexHover,
  resolveEllipseArcHover,
  resolveResizeHover,
  resolveCornerRadiusHover,
  resolveRotateHover,
  resolvePlainNodeHover,
];
