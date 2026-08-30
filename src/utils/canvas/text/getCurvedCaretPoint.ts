// types
import { TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextPathSampler } from './pathSampler/types';

// utils
import { getCurvedGlyphBoundaries } from './getCurvedGlyphBoundaries';

export type TCurvedPoint = TPoint & {
  angleDegrees: number;
};

export const getCurvedCaretPoint = (
  atlas: TGlyphAtlasJson,
  content: string,
  fontSize: number,
  pathCenter: TPoint,
  startOffset: number,
  flip: boolean,
  sampler: TTextPathSampler,
  caretIndex: number,
): TCurvedPoint => {
  const boundaries = getCurvedGlyphBoundaries(atlas, content, fontSize, startOffset, flip, sampler.totalLength);
  const clampedIndex = Math.max(0, Math.min(caretIndex, boundaries.length - 1));
  const sample = sampler.sampleAtLength(boundaries[clampedIndex]);

  return {
    angleDegrees: sample.angleDegrees + (flip ? 180 : 0),
    x: pathCenter.x + sample.x,
    y: pathCenter.y + sample.y,
  };
};
