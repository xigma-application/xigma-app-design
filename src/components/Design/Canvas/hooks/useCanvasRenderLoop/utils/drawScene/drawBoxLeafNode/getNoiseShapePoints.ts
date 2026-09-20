// types
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

const NOISE_BOUNDS_PADDING = 2;

export const getNoiseShapePoints = (node: TFrameNode | TRectangleNode): TPoint[] => {
  const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const margin = ('strokeWidth' in node ? (node.strokeWidth ?? 0) : 0) + NOISE_BOUNDS_PADDING;
  const [left, top, right, bottom] = [node.x - margin, node.y - margin, node.x + node.width + margin, node.y + node.height + margin];

  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ].map((point) => rotatePoint(point, center, node.rotation));
};
