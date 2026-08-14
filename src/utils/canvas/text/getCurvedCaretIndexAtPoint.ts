// types
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { buildEllipseArcLengthTable } from '../shapes/buildEllipseArcLengthTable';
import { flipTextPoint } from './flipTextPoint';
import { getCurvedGlyphBoundaries } from './getCurvedGlyphBoundaries';
import { getEllipseCircumference } from '../shapes/getEllipseCircumference';
import { getFittedPathFontSize } from './getFittedPathFontSize';
import { getNearestEllipsePathOffset } from '../shapes/getNearestEllipsePathOffset/getNearestEllipsePathOffset';
import { rotatePoint } from 'utils/math/rotatePoint';

export type TCurvedCaretHit = {
  distance: number;
  index: number;
};

export const getCurvedCaretIndexAtPoint = (
  atlas: TGlyphAtlasJson,
  content: string,
  fontSize: number,
  box: TEditingTextBox,
  point: TPoint,
): TCurvedCaretHit => {
  const table = buildEllipseArcLengthTable(box.width, box.height);
  const circumference = getEllipseCircumference(table);
  const fittedFontSize = getFittedPathFontSize(atlas, content, fontSize, circumference);
  const boundaries = getCurvedGlyphBoundaries(
    atlas,
    content,
    fittedFontSize,
    box.pathStartOffset ?? 0,
    box.pathFlip ?? false,
    circumference,
  );
  const minBoundary = Math.min(boundaries[0], boundaries[boundaries.length - 1]);
  const maxBoundary = Math.max(boundaries[0], boundaries[boundaries.length - 1]);
  const center: TPoint = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const unrotated = rotatePoint(point, center, -box.rotation);
  const localPoint = flipTextPoint(unrotated, box);
  const nearest = getNearestEllipsePathOffset(localPoint, { ...box, rotation: 0 }, table);
  const rawLength = nearest.offset * circumference;

  const distanceToRange = (length: number): number => (length < minBoundary ? minBoundary - length : Math.max(length - maxBoundary, 0));
  const nearestLength = [rawLength - circumference, rawLength, rawLength + circumference].reduce((closest, candidate) =>
    distanceToRange(candidate) < distanceToRange(closest) ? candidate : closest,
  );

  const clampedLength = Math.min(Math.max(nearestLength, minBoundary), maxBoundary);

  let bestIndex = 0;
  let bestDistance = Infinity;

  boundaries.forEach((boundary, index) => {
    const distance = Math.abs(boundary - clampedLength);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  const distance = nearest.distance + distanceToRange(nearestLength);

  return { distance, index: bestIndex };
};
