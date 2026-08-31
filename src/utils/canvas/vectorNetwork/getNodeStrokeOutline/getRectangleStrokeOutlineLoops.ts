// others
import { ROUNDED_RECT_CORNER_SEGMENTS } from 'constant/canvas';

// types
import { TRectangleNode } from 'types/design/types';

// utils
import { getMaxCornerRadius } from 'utils/canvas/cornerRadius/getMaxCornerRadius';
import { getRoundedRectPoints } from 'utils/canvas/shapes/getRoundedRectPoints';
import { TStrokeOutlineLoops } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';

export const getRectangleStrokeOutlineLoops = (node: TRectangleNode, halfWidth: number): TStrokeOutlineLoops => {
  const cornerRadius = Math.min(Math.max(node.cornerRadius ?? 0, 0), getMaxCornerRadius(node));
  const outer = getRoundedRectPoints(
    {
      cornerRadius: cornerRadius + halfWidth,
      height: node.height + halfWidth * 2,
      width: node.width + halfWidth * 2,
      x: node.x - halfWidth,
      y: node.y - halfWidth,
    },
    ROUNDED_RECT_CORNER_SEGMENTS,
  );
  const innerWidth = node.width - halfWidth * 2;
  const innerHeight = node.height - halfWidth * 2;
  const inner =
    innerWidth > 0 && innerHeight > 0
      ? getRoundedRectPoints(
          {
            cornerRadius: Math.max(cornerRadius - halfWidth, 0),
            height: innerHeight,
            width: innerWidth,
            x: node.x + halfWidth,
            y: node.y + halfWidth,
          },
          ROUNDED_RECT_CORNER_SEGMENTS,
        )
      : null;

  return { inner, outer };
};
