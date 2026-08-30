// types
import { TCanvasRefs, TVectorWidthPointHover } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getVectorWidthLabelRects, isPointInVectorWidthLabelRect } from './getVectorWidthLabelRects';

export const getVectorWidthLabelAtPoint = (
  point: TPoint,
  nodes: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  zoom: number,
): TVectorWidthPointHover | null => {
  const rect = getVectorWidthLabelRects(refs, nodes, zoom).find((candidate) => isPointInVectorWidthLabelRect(point, candidate));

  return rect ? { nodeId: rect.target.nodeId, segmentId: rect.segmentId, t: rect.t } : null;
};
