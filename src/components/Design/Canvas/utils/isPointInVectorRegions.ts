// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorFillLoopKeyAtPoint } from 'utils/canvas/vectorNetwork/getVectorFillLoopKeyAtPoint';

export const isPointInVectorRegions = (point: TPoint, node: TVectorNode): boolean =>
  getVectorFillLoopKeyAtPoint(node, point) !== null;
