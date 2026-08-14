// types
import { TEditingTextBox, TPoint } from 'types/canvas';

// utils
import { buildEllipseArcLengthTable } from 'utils/canvas/shapes/buildEllipseArcLengthTable';
import { flipTextPoint } from 'utils/canvas/text/flipTextPoint';
import { getEllipseCircumference } from 'utils/canvas/shapes/getEllipseCircumference';
import { getEllipsePathSample } from 'utils/canvas/shapes/getEllipsePathSample';
import { rotatePoint } from 'utils/math/rotatePoint';

// accepts either a real, committed path-text node or the live editing box for one that hasn't
// been committed yet (e.g. still being drawn for the first time) — both carry the same geometry
export const getPathTextHandlePoint = (node: TEditingTextBox): TPoint | null => {
  let handlePoint: TPoint | null = null;

  if (node.pathId) {
    const table = buildEllipseArcLengthTable(node.width, node.height);
    const sample = getEllipsePathSample(node.width, node.height, table, (node.pathStartOffset ?? 0) * getEllipseCircumference(table));
    const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    const localPoint = flipTextPoint({ x: center.x + sample.x, y: center.y + sample.y }, node);

    handlePoint = rotatePoint(localPoint, center, node.rotation);
  }

  return handlePoint;
};
