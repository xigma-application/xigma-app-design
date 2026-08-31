// types
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

export const isStraightEdge = (edge: TLoopEdge): boolean => edge.tangentStart === null && edge.tangentEnd === null;
