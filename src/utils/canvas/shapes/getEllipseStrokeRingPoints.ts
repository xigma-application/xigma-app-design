// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TEllipseNode } from 'types/design/types';

// utils
import { getEllipsePoints } from './getEllipsePoints';
import { getStrokeAlignInset } from 'utils/canvas/getStrokeAlignInset/getStrokeAlignInset';

export const getEllipseStrokeRingPoints = (node: TEllipseNode, strokeWidth: number): TPoint[][] => {
  const { inner, outer } = getStrokeAlignInset(strokeWidth, node.strokeAlign);
  const outerPoints = getEllipsePoints(
    { height: node.height + outer * 2, width: node.width + outer * 2, x: node.x - outer, y: node.y - outer },
    ELLIPSE_SEGMENTS,
  );
  const innerPoints = getEllipsePoints(
    { height: node.height - inner * 2, width: node.width - inner * 2, x: node.x + inner, y: node.y + inner },
    ELLIPSE_SEGMENTS,
  );

  return [outerPoints, innerPoints];
};
