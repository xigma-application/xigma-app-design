// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorFillLoopPoints } from './getVectorFillLoopPoints/getVectorFillLoopPoints';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

export const getVectorFillLoopKeyAtPoint = (node: TVectorNode, point: TPoint): string | null =>
  node.filledFaceKeys.find((key) => {
    const points = getVectorFillLoopPoints(node, key);

    return points && isPointInPolygonVertices(point, points);
  }) ?? null;
