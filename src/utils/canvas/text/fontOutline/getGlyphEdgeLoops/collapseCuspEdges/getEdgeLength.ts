// types
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

export const getEdgeLength = (edge: TLoopEdge): number => Math.hypot(edge.end.x - edge.start.x, edge.end.y - edge.start.y);
