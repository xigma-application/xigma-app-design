// utils
import { resolveEdgePointHover } from './hoverResolvers/resolveEdgePointHover';
import { resolveVertexPointHover } from './hoverResolvers/resolveVertexPointHover';

export const PEN_POINT_HOVER_RESOLVERS = [resolveVertexPointHover, resolveEdgePointHover];
