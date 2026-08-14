// types
import { TCurvedPoint } from './getCurvedCaretPoint';
import { TEllipseArcLengthSample, TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getCurvedGlyphBoundaries } from './getCurvedGlyphBoundaries';
import { getEllipseCircumference } from '../shapes/getEllipseCircumference';
import { getEllipsePathSample } from '../shapes/getEllipsePathSample';

export type TCurvedSelectionRect = TCurvedPoint & {
  height: number;
  width: number;
};

export const getCurvedSelectionRects = (
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
): TCurvedSelectionRect[] => {
  const circumference = getEllipseCircumference(arcLengthTable);
  const boundaries = getCurvedGlyphBoundaries(atlas, content, fontSize, startOffset, flip, circumference);
  const clampedStart = Math.max(0, Math.min(start, content.length));
  const clampedEnd = Math.max(0, Math.min(end, content.length));

  return Array.from({ length: Math.max(0, clampedEnd - clampedStart) }, (_, index) => {
    const charIndex = clampedStart + index;
    const segmentStart = boundaries[charIndex];
    const segmentEnd = boundaries[charIndex + 1];
    const sample = getEllipsePathSample(ellipseWidth, ellipseHeight, arcLengthTable, (segmentStart + segmentEnd) / 2);

    return {
      angleDegrees: sample.angleDegrees + (flip ? 180 : 0),
      height: lineHeight,
      width: Math.abs(segmentEnd - segmentStart),
      x: ellipseCenter.x + sample.x,
      y: ellipseCenter.y + sample.y,
    };
  });
};
