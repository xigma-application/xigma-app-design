// others
import { ROUNDED_RECT_CORNER_SEGMENTS } from 'constant/canvas';

// types
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getBoxEffectShapeRect } from './getBoxEffectShapeRect';
import { getRoundedRectPoints } from 'utils/canvas/shapes/getRoundedRectPoints';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getNoiseShapePoints = (node: TFrameNode | TRectangleNode): TPoint[] => {
  const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const rect = { ...getBoxEffectShapeRect(node, 0), x: node.x, y: node.y };

  return getRoundedRectPoints(rect, ROUNDED_RECT_CORNER_SEGMENTS).map((point) => rotatePoint(point, center, node.rotation));
};
