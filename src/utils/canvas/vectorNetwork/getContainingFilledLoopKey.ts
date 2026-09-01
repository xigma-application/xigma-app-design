// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getPointInsideFace } from './buildVectorNodeFromLoops/assembleVectorNodeFromLoopGeometries/getPointInsideFace';
import { getPolygonArea } from 'components/Design/Canvas/utils/getPolygonArea';
import { getVectorFillLoopPoints } from './getVectorFillLoopPoints/getVectorFillLoopPoints';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

export const getContainingFilledLoopKey = (node: TVectorNode, facePoints: TPoint[]): string | null => {
  const facePoint = getPointInsideFace(facePoints);
  const faceArea = getPolygonArea(facePoints);

  const candidates = node.filledFaceKeys
    .map((key) => ({ key, points: getVectorFillLoopPoints(node, key) }))
    .filter((candidate): candidate is { key: string; points: TPoint[] } => Boolean(candidate.points))
    .filter((candidate) => getPolygonArea(candidate.points) > faceArea)
    .filter((candidate) => isPointInPolygonVertices(facePoint, candidate.points));

  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce((smallest, candidate) =>
    getPolygonArea(candidate.points) < getPolygonArea(smallest.points) ? candidate : smallest,
  ).key;
};
