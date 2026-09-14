// constant
import { PATTERN_PLACEHOLDER_DOT_RADIUS_PX, PATTERN_PLACEHOLDER_DOT_SEGMENTS, PATTERN_PLACEHOLDER_DOT_SPACING_PX } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';

// utils
import { getEllipsePoints } from '../shapes/getEllipsePoints';

export const getPatternPlaceholderDotVertices = (nodeBounds: TDraftRect): number[] => {
  const columns = Math.max(1, Math.round(nodeBounds.width / PATTERN_PLACEHOLDER_DOT_SPACING_PX));
  const rows = Math.max(1, Math.round(nodeBounds.height / PATTERN_PLACEHOLDER_DOT_SPACING_PX));
  const stepX = nodeBounds.width / columns;
  const stepY = nodeBounds.height / rows;
  const vertices: number[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const centerX = nodeBounds.x + stepX * (column + 0.5);
      const centerY = nodeBounds.y + stepY * (row + 0.5);
      const points = getEllipsePoints(
        {
          height: PATTERN_PLACEHOLDER_DOT_RADIUS_PX * 2,
          width: PATTERN_PLACEHOLDER_DOT_RADIUS_PX * 2,
          x: centerX - PATTERN_PLACEHOLDER_DOT_RADIUS_PX,
          y: centerY - PATTERN_PLACEHOLDER_DOT_RADIUS_PX,
        },
        PATTERN_PLACEHOLDER_DOT_SEGMENTS,
      );

      points.forEach((point, index) => {
        const next = points[(index + 1) % points.length];

        vertices.push(centerX, centerY, point.x, point.y, next.x, next.y);
      });
    }
  }

  return vertices;
};
