// types
import { TPoint } from 'types/canvas';

// utils
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

export type TWalkState = {
  current: TPoint;
  edges: TLoopEdge[];
  loops: TLoopEdge[][];
  subpathStart: TPoint;
};
