// others
import { ROUNDED_RECT_CORNER_SEGMENTS } from 'constant/canvas';

// types
import { TRectangleNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getMaxCornerRadius } from 'utils/canvas/cornerRadius/getMaxCornerRadius';
import { getRoundedRectPoints } from 'utils/canvas/shapes/getRoundedRectPoints';
import { TStrokeOutlineLoops } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';

const getRectangleInnerLoop = (node: TRectangleNode, cornerRadius: number, inner: number): TPoint[] | null => {
  const innerWidth = node.width - inner * 2;
  const innerHeight = node.height - inner * 2;

  return innerWidth > 0 && innerHeight > 0
    ? getRoundedRectPoints(
        {
          cornerRadius: Math.max(cornerRadius - inner, 0),
          height: innerHeight,
          width: innerWidth,
          x: node.x + inner,
          y: node.y + inner,
        },
        ROUNDED_RECT_CORNER_SEGMENTS,
      )
    : null;
};

export const getRectangleStrokeOutlineLoops = (node: TRectangleNode, outer: number, inner: number = outer): TStrokeOutlineLoops => {
  const cornerRadius = Math.min(Math.max(node.cornerRadius ?? 0, 0), getMaxCornerRadius(node));
  const height = node.height + outer * 2;
  const width = node.width + outer * 2;
  const x = node.x - outer;
  const y = node.y - outer;
  const ctx = { cornerRadius: cornerRadius + outer, height, width, x, y };
  const outerLoop = getRoundedRectPoints(ctx, ROUNDED_RECT_CORNER_SEGMENTS);
  const innerLoop = getRectangleInnerLoop(node, cornerRadius, inner);

  return { inner: innerLoop, outer: outerLoop };
};
