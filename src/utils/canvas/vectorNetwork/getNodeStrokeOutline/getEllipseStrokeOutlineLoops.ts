// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TEllipseNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getEllipsePoints } from 'utils/canvas/shapes/getEllipsePoints';
import { TStrokeOutlineLoops } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';

const getEllipseInnerLoop = (node: TEllipseNode, inner: number): TPoint[] | null => {
  const innerWidth = node.width - inner * 2;
  const innerHeight = node.height - inner * 2;

  return innerWidth > 0 && innerHeight > 0
    ? getEllipsePoints({ height: innerHeight, width: innerWidth, x: node.x + inner, y: node.y + inner }, ELLIPSE_SEGMENTS)
    : null;
};

export const getEllipseStrokeOutlineLoops = (node: TEllipseNode, outer: number, inner: number = outer): TStrokeOutlineLoops => {
  const height = node.height + outer * 2;
  const width = node.width + outer * 2;
  const x = node.x - outer;
  const y = node.y - outer;
  const outerLoop = getEllipsePoints({ height, width, x, y }, ELLIPSE_SEGMENTS);
  const innerLoop = getEllipseInnerLoop(node, inner);

  return { inner: innerLoop, outer: outerLoop };
};
