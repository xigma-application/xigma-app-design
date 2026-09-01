// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getEffectiveVectorFillColor } from '../vectorNetwork/getEffectiveVectorFillColor';
import { getPointInsideFace } from '../vectorNetwork/buildVectorNodeFromLoops/assembleVectorNodeFromLoopGeometries/getPointInsideFace';
import { getVectorFillLoopPoints } from '../vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

export type TFillRenderGroup = { color: string; polygons: TPoint[][] };

const getActiveHoleParentKey = (node: TVectorNode, key: string, pointsByKey: Map<string, TPoint[]>): string | null => {
  const parentKey = node.holeParentByKey?.[key];
  const points = pointsByKey.get(key);
  const parentPoints = parentKey ? pointsByKey.get(parentKey) : undefined;

  if (!parentKey || !points || !parentPoints) {
    return null;
  }

  const colorsStillMatch = getEffectiveVectorFillColor(node, key) === getEffectiveVectorFillColor(node, parentKey);
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

    if (!points) {
      return;
    }

    const isFormerHole = Boolean(renderedNode.holeParentByKey?.[key]);
    const activeParentKey = isFormerHole ? getActiveHoleParentKey(renderedNode, key, pointsByKey) : null;
    const color = getEffectiveVectorFillColor(renderedNode, activeParentKey ?? key);
    const groupKey = isFormerHole && !activeParentKey ? key : color;
    const group = groups.get(groupKey) ?? { color, polygons: [] };

    group.polygons.push(points);
    groups.set(groupKey, group);
  });

  return Array.from(groups.values());
};
