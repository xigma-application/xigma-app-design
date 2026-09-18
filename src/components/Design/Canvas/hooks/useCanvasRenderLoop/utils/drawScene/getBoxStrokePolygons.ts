// types
import { StrokeAlign } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// others
import { ROUNDED_RECT_CORNER_SEGMENTS } from 'constant/canvas';

// utils
import { getRoundedRectPoints, TRoundedRect } from 'utils/canvas/shapes/getRoundedRectPoints';
import { getStrokeAlignInset } from 'utils/canvas/getStrokeAlignInset/getStrokeAlignInset';
import { rotatePoint } from 'utils/math/rotatePoint';

const offsetRadius = (radius: number | undefined, delta: number): number | undefined =>
  radius !== undefined && radius > 0 ? Math.max(0, radius + delta) : radius;

const getOffsetRect = (node: TFrameNode | TRectangleNode, delta: number): TRoundedRect => ({
  cornerRadius: offsetRadius(node.cornerRadius ?? 0, delta) ?? 0,
  cornerRadiusBottomLeft: offsetRadius(node.cornerRadiusBottomLeft, delta),
  cornerRadiusBottomRight: offsetRadius(node.cornerRadiusBottomRight, delta),
  cornerRadiusTopLeft: offsetRadius(node.cornerRadiusTopLeft, delta),
  cornerRadiusTopRight: offsetRadius(node.cornerRadiusTopRight, delta),
  cornerSmoothing: node.cornerSmoothing,
  height: Math.max(0, node.height + 2 * delta),
  width: Math.max(0, node.width + 2 * delta),
  x: node.x - delta,
  y: node.y - delta,
});

export const getBoxStrokePolygons = (
  node: TFrameNode | TRectangleNode,
  strokeWidth: number,
  strokeAlign: StrokeAlign | undefined,
): TPoint[][] => {
  const { inner, outer } = getStrokeAlignInset(strokeWidth, strokeAlign ?? StrokeAlign.inside);
  const center = { x: node.x + node.width / 2, y: node.y + node.height / 2 };

  return [getOffsetRect(node, outer), getOffsetRect(node, -inner)].map((rect) =>
    getRoundedRectPoints(rect, ROUNDED_RECT_CORNER_SEGMENTS).map((point) => rotatePoint(point, center, node.rotation)),
  );
};
