// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';
import { TVectorWidthLabelEdit } from './types';

// utils
import { getVectorWidthLabelRects, isPointInVectorWidthLabelRect } from '../../../utils/getVectorWidthLabelRects';

export const getWidthLabelEditAtPoint = (
  point: TPoint,
  refs: TCanvasRefs,
  nodes: Record<string, TSceneNode>,
  zoom: number,
): TVectorWidthLabelEdit | null => {
  const rect = getVectorWidthLabelRects(refs, nodes, zoom).find((candidate) => isPointInVectorWidthLabelRect(point, candidate));

  if (rect) {
    return {
      badgeHeight: rect.badgeHeight,
      badgeWidth: rect.badgeWidth,
      center: rect.center,
      nodeId: rect.target.nodeId,
      pointId: rect.target.point.id,
      value: Math.round(rect.target.point.leftOffset + rect.target.point.rightOffset),
    };
  }

  return null;
};
