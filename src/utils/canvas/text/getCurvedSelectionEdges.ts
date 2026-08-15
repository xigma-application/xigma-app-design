// others
import { MAX_CURVED_SELECTION_SPAN_DEGREES } from 'constant/canvas';

// types
import { TEllipseArcLengthSample, TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getCurvedGlyphBoundaries } from './getCurvedGlyphBoundaries';
import { getEllipseCircumference } from '../shapes/getEllipseCircumference';
import { getEllipsePathSample } from '../shapes/getEllipsePathSample';
import { rotatePoint } from 'utils/math/rotatePoint';

const ORIGIN: TPoint = { x: 0, y: 0 };

export type TCurvedSelectionEdge = {
  bottom: TPoint;
  top: TPoint;
};

export const getCurvedSelectionEdges = (
  atlas: TGlyphAtlasJson,
  content: string,
  fontSize: number,
  ellipseWidth: number,
  ellipseHeight: number,
  ellipseCenter: TPoint,
  startOffset: number,
  flip: boolean,
  arcLengthTable: TEllipseArcLengthSample[],
  lineHeight: number,
  start: number,
  end: number,
): TCurvedSelectionEdge[] => {
  const circumference = getEllipseCircumference(arcLengthTable);
  const boundaries = getCurvedGlyphBoundaries(atlas, content, fontSize, startOffset, flip, circumference);
  const clampedStart = Math.max(0, Math.min(start, content.length));
  const clampedEnd = Math.max(0, Math.min(end, content.length));

  if (clampedEnd > clampedStart) {
    const direction = flip ? -1 : 1;
    const startLength = boundaries[clampedStart];
    const maxSpan = (MAX_CURVED_SELECTION_SPAN_DEGREES / 360) * circumference;

    return boundaries.slice(clampedStart, clampedEnd + 1).map((length) => {
      // never let the ribbon span more than a full turn, otherwise it wraps back over its own
      // start and the fill/outline start overlapping themselves
      const clampedLength = direction > 0 ? Math.min(length, startLength + maxSpan) : Math.max(length, startLength - maxSpan);
      const sample = getEllipsePathSample(ellipseWidth, ellipseHeight, arcLengthTable, clampedLength);
      const angleDegrees = sample.angleDegrees + (flip ? 180 : 0);
      const anchor: TPoint = { x: ellipseCenter.x + sample.x, y: ellipseCenter.y + sample.y };
      const top = rotatePoint({ x: 0, y: -lineHeight / 2 }, ORIGIN, angleDegrees);
      const bottom = rotatePoint({ x: 0, y: lineHeight / 2 }, ORIGIN, angleDegrees);

      return {
        bottom: { x: anchor.x + bottom.x, y: anchor.y + bottom.y },
        top: { x: anchor.x + top.x, y: anchor.y + top.y },
      };
    });
  }

  return [];
};
