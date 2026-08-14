// types
import { TEllipseArcLengthSample, TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getCurvedGlyphBoundaries } from './getCurvedGlyphBoundaries';
import { getEllipseCircumference } from '../shapes/getEllipseCircumference';
import { getEllipsePathSample } from '../shapes/getEllipsePathSample';

export type TCurvedPoint = TPoint & {
  angleDegrees: number;
};

export const getCurvedCaretPoint = (
  atlas: TGlyphAtlasJson,
  content: string,
  fontSize: number,
  ellipseWidth: number,
  ellipseHeight: number,
  ellipseCenter: TPoint,
  startOffset: number,
  flip: boolean,
  arcLengthTable: TEllipseArcLengthSample[],
  caretIndex: number,
): TCurvedPoint => {
  const circumference = getEllipseCircumference(arcLengthTable);
  const boundaries = getCurvedGlyphBoundaries(atlas, content, fontSize, startOffset, flip, circumference);
  const clampedIndex = Math.max(0, Math.min(caretIndex, boundaries.length - 1));
  const sample = getEllipsePathSample(ellipseWidth, ellipseHeight, arcLengthTable, boundaries[clampedIndex]);

  return {
    angleDegrees: sample.angleDegrees + (flip ? 180 : 0),
    x: ellipseCenter.x + sample.x,
    y: ellipseCenter.y + sample.y,
  };
};
