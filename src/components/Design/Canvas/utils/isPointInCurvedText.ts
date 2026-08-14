// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TPoint } from 'types/canvas';
import { TTextNode } from 'types/design/types';

// utils
import { buildEllipseArcLengthTable } from 'utils/canvas/shapes/buildEllipseArcLengthTable';
import { flipTextPoint } from 'utils/canvas/text/flipTextPoint';
import { getCurvedGlyphBoundaries } from 'utils/canvas/text/getCurvedGlyphBoundaries';
import { getEllipseCircumference } from 'utils/canvas/shapes/getEllipseCircumference';
import { getFittedPathFontSize } from 'utils/canvas/text/getFittedPathFontSize';
import { getNearestEllipsePathOffset } from 'utils/canvas/shapes/getNearestEllipsePathOffset/getNearestEllipsePathOffset';
import { rotatePoint } from 'utils/math/rotatePoint';

export const isPointInCurvedText = (point: TPoint, node: TTextNode, tolerance: number): boolean => {
  const table = buildEllipseArcLengthTable(node.width, node.height);
  const circumference = getEllipseCircumference(table);
  const fontSize = getFittedPathFontSize(MSDF_ATLAS_JSON, node.content, node.fontSize, circumference);
  const boundaries = getCurvedGlyphBoundaries(
    MSDF_ATLAS_JSON,
    node.content,
    fontSize,
    node.pathStartOffset ?? 0,
    node.pathFlip ?? false,
    circumference,
  );
  const minBoundary = Math.min(boundaries[0], boundaries[boundaries.length - 1]);
  const maxBoundary = Math.max(boundaries[0], boundaries[boundaries.length - 1]);
  const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const unrotated = rotatePoint(point, center, -node.rotation);
  const localPoint = flipTextPoint(unrotated, node);
  const nearest = getNearestEllipsePathOffset(localPoint, { ...node, rotation: 0 }, table);
  const nearestLength = nearest.offset * circumference;
  const isAlongContent = [nearestLength - circumference, nearestLength, nearestLength + circumference].some(
    (length) => length >= minBoundary - tolerance && length <= maxBoundary + tolerance,
  );

  return isAlongContent && nearest.distance <= tolerance;
};
