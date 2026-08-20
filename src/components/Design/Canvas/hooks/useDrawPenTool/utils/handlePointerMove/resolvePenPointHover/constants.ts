// utils
import { resolveActiveVertexHover } from './hoverResolvers/resolveActiveVertexHover';
import { resolveEdgePointHover } from './hoverResolvers/resolveEdgePointHover';
import { resolveVertexPointHover } from './hoverResolvers/resolveVertexPointHover';

export const PEN_POINT_HOVER_RESOLVERS = [resolveActiveVertexHover, resolveVertexPointHover, resolveEdgePointHover];
