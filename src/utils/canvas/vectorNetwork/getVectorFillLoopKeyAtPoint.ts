// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getPolygonArea } from 'components/Design/Canvas/utils/getPolygonArea';
import { getVectorFillLoopPoints } from './getVectorFillLoopPoints/getVectorFillLoopPoints';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

type TFillLoopCandidate = { key: string; points: TPoint[] };

export const getVectorFillLoopKeyAtPoint = (node: TVectorNode, point: TPoint): string | null =>
  node.filledFaceKeys
    .map((key) => ({ key, points: getVectorFillLoopPoints(node, key) }))
    .filter((candidate): candidate is TFillLoopCandidate => candidate.points !== null && isPointInPolygonVertices(point, candidate.points))
    .reduce<TFillLoopCandidate | null>((smallest, candidate) => {
      if (!smallest || getPolygonArea(candidate.points) < getPolygonArea(smallest.points)) {
        return candidate;
      }

      return smallest;
    }, null)?.key ?? null;
