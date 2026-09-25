// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getLineStrokeBounds } from 'utils/canvas/line/stroke/getLineStrokeBounds';
import { getNodeBounds } from './getNodeBounds';
import { getPaddedRect } from 'utils/design/stroke/getPaddedRect';
import { getRectCorners } from 'utils/canvas/getRectCorners';
import { getRotatedNodeBounds } from './getRotatedNodeBounds';
import { getStrokePaddings } from 'utils/design/stroke/getStrokePaddings';
import { rotatePoint } from 'utils/math/rotatePoint';

const getRotatedPaddedBounds = (padded: TDraftRect, center: TPoint, rotation: number): TDraftRect => {
  const corners = getRectCorners(padded).map((corner) => rotatePoint(corner, center, rotation));
  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);

  return { height: Math.max(...ys) - Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), x: Math.min(...xs), y: Math.min(...ys) };
};

export const getStrokedRotatedNodeBounds = (node: TSceneNode): TDraftRect => {
  const bounds = getNodeBounds(node);
  const padded = getPaddedRect(bounds, getStrokePaddings(node));
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

  switch (node.type) {
    case NodeType.line:
      return getLineStrokeBounds(node) ?? getRotatedNodeBounds(node);
    case NodeType.vector:
      return getRotatedNodeBounds(node);
    default:
      return node.rotation === 0 ? padded : getRotatedPaddedBounds(padded, center, node.rotation);
  }
};
