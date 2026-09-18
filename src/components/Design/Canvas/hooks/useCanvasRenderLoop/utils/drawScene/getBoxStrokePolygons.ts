// types
import { StrokeAlign } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TPoint } from 'types/canvas';
import { TStrokeSideWidths } from 'utils/design/stroke/types';

// others
import { ROUNDED_RECT_CORNER_SEGMENTS } from 'constant/canvas';

// utils
import { getRoundedRectPoints, TRoundedRect } from 'utils/canvas/shapes/getRoundedRectPoints';
import { getStrokeAlignInset } from 'utils/canvas/getStrokeAlignInset/getStrokeAlignInset';
import { rotatePoint } from 'utils/math/rotatePoint';

const offsetRadius = (radius: number, firstDelta: number, secondDelta: number): number =>
  radius > 0 ? Math.max(0, radius + (firstDelta + secondDelta) / 2) : 0;

const getOffsetRect = (node: TFrameNode | TRectangleNode, top: number, right: number, bottom: number, left: number): TRoundedRect => {
  const uniform = node.cornerRadius ?? 0;

  return {
    cornerRadius: 0,
    cornerRadiusBottomLeft: offsetRadius(node.cornerRadiusBottomLeft ?? uniform, bottom, left),
    cornerRadiusBottomRight: offsetRadius(node.cornerRadiusBottomRight ?? uniform, bottom, right),
    cornerRadiusTopLeft: offsetRadius(node.cornerRadiusTopLeft ?? uniform, top, left),
    cornerRadiusTopRight: offsetRadius(node.cornerRadiusTopRight ?? uniform, top, right),
    cornerSmoothing: node.cornerSmoothing,
    height: Math.max(0, node.height + top + bottom),
    width: Math.max(0, node.width + left + right),
    x: node.x - left,
    y: node.y - top,
  };
};

export const getBoxStrokePolygons = (
  node: TFrameNode | TRectangleNode,
  widths: TStrokeSideWidths,
  strokeAlign: StrokeAlign | undefined,
): TPoint[][] => {
  const align = strokeAlign ?? StrokeAlign.inside;
  const bottom = getStrokeAlignInset(widths.bottom, align);
  const left = getStrokeAlignInset(widths.left, align);
  const right = getStrokeAlignInset(widths.right, align);
  const top = getStrokeAlignInset(widths.top, align);
  const center = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const rects = [
    getOffsetRect(node, top.outer, right.outer, bottom.outer, left.outer),
    getOffsetRect(node, -top.inner, -right.inner, -bottom.inner, -left.inner),
  ];

  return rects.map((rect) =>
    getRoundedRectPoints(rect, ROUNDED_RECT_CORNER_SEGMENTS).map((point) => rotatePoint(point, center, node.rotation)),
  );
};
