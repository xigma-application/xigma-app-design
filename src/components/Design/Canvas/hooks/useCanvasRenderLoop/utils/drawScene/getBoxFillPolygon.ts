// types
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// others
import { ROUNDED_RECT_CORNER_SEGMENTS } from 'constant/canvas';

// utils
import { getRoundedRectPoints } from 'utils/canvas/shapes/getRoundedRectPoints';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getBoxFillPolygon = (node: TFrameNode | TRectangleNode): TPoint[] => {
  const center = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const points = getRoundedRectPoints({ ...node, cornerRadius: node.cornerRadius ?? 0 }, ROUNDED_RECT_CORNER_SEGMENTS);

  return points.map((point) => rotatePoint(point, center, node.rotation));
};
