// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TEllipseNode } from 'types/design/types';

// utils
import { getEllipsePoints } from 'utils/canvas/shapes/getEllipsePoints';
import { TStrokeOutlineLoops } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';

export const getEllipseStrokeOutlineLoops = (node: TEllipseNode, halfWidth: number): TStrokeOutlineLoops => {
  const outer = getEllipsePoints(
    { height: node.height + halfWidth * 2, width: node.width + halfWidth * 2, x: node.x - halfWidth, y: node.y - halfWidth },
    ELLIPSE_SEGMENTS,
  );
  const innerWidth = node.width - halfWidth * 2;
  const innerHeight = node.height - halfWidth * 2;
  const inner =
    innerWidth > 0 && innerHeight > 0
      ? getEllipsePoints({ height: innerHeight, width: innerWidth, x: node.x + halfWidth, y: node.y + halfWidth }, ELLIPSE_SEGMENTS)
      : null;

  return { inner, outer };
};
