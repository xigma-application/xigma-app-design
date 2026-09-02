// types
import { TPaint } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getEffectiveVectorFill } from '../vectorNetwork/getEffectiveVectorFill';
import { getPointInsideFace } from '../vectorNetwork/buildVectorNodeFromLoops/assembleVectorNodeFromLoopGeometries/getPointInsideFace';
import { getVectorFillLoopPoints } from '../vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';
import { paintGroupKey } from 'utils/design/paint/paintGroupKey';

export type TFillRenderGroup = { paint: TPaint[]; polygons: TPoint[][] };

const getActiveHoleParentKey = (node: TVectorNode, key: string, parentKey: string, pointsByKey: Map<string, TPoint[]>): string | null => {
  const points = pointsByKey.get(key);
  const parentPoints = pointsByKey.get(parentKey);

  if (!points || !parentPoints) {
    return null;
  }

  const colorsStillMatch = paintGroupKey(getEffectiveVectorFill(node, key)) === paintGroupKey(getEffectiveVectorFill(node, parentKey));
  const isStillNested = isPointInPolygonVertices(getPointInsideFace(points), parentPoints);

  return colorsStillMatch && isStillNested ? parentKey : null;
};

export const groupFilledFacesForRendering = (renderedNode: TVectorNode): TFillRenderGroup[] => {
  const pointsByKey = new Map<string, TPoint[]>();

  renderedNode.filledFaceKeys.forEach((key) => {
    const points = getVectorFillLoopPoints(renderedNode, key);

    if (points) {
      pointsByKey.set(key, points);
    }
  });

  const groups = new Map<string, TFillRenderGroup>();

  renderedNode.filledFaceKeys.forEach((key) => {
    const points = pointsByKey.get(key);

    if (points) {
      const parentKey = renderedNode.holeParentByKey?.[key];
      const isFormerHole = Boolean(parentKey);
      const activeParentKey = parentKey ? getActiveHoleParentKey(renderedNode, key, parentKey, pointsByKey) : null;
      const paint = getEffectiveVectorFill(renderedNode, activeParentKey ?? key);
      const groupKey = isFormerHole && !activeParentKey ? key : paintGroupKey(paint);
      const group = groups.get(groupKey) ?? { paint, polygons: [] };

      group.polygons.push(points);
      groups.set(groupKey, group);
    }
  });

  return Array.from(groups.values());
};
