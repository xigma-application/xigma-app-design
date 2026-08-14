// types
import { TPoint } from 'types/canvas';
import { TTextNode } from 'types/design/types';

// utils
import { buildEllipseArcLengthTable } from 'utils/canvas/shapes/buildEllipseArcLengthTable';
import { getEllipseCircumference } from 'utils/canvas/shapes/getEllipseCircumference';
import { getEllipsePathSample } from 'utils/canvas/shapes/getEllipsePathSample';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getPathTextHandlePoint = (node: TTextNode): TPoint | null => {
  let handlePoint: TPoint | null = null;

  if (node.pathId) {
    const table = buildEllipseArcLengthTable(node.width, node.height);
    const sample = getEllipsePathSample(node.width, node.height, table, (node.pathStartOffset ?? 0) * getEllipseCircumference(table));
    const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };

    handlePoint = rotatePoint({ x: center.x + sample.x, y: center.y + sample.y }, center, node.rotation);
  }

  return handlePoint;
};
