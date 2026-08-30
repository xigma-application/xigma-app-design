// others
import { MAX_CURVED_SELECTION_SPAN_DEGREES } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextPathSampler } from './pathSampler/types';

// utils
import { getCurvedGlyphBoundaries } from './getCurvedGlyphBoundaries';
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
  pathCenter: TPoint,
  startOffset: number,
  flip: boolean,
  sampler: TTextPathSampler,
  lineHeight: number,
  start: number,
  end: number,
): TCurvedSelectionEdge[] => {
  const boundaries = getCurvedGlyphBoundaries(atlas, content, fontSize, startOffset, flip, sampler.totalLength);
  const clampedStart = Math.max(0, Math.min(start, content.length));
  const clampedEnd = Math.max(0, Math.min(end, content.length));

  if (clampedEnd > clampedStart) {
    const direction = flip ? -1 : 1;
    const startLength = boundaries[clampedStart];
    const maxSpan = (MAX_CURVED_SELECTION_SPAN_DEGREES / 360) * sampler.totalLength;
    const baseRatio = atlas.common.base / atlas.common.lineHeight;
    const ascent = lineHeight * baseRatio;
    const descent = lineHeight * (1 - baseRatio);

    return boundaries.slice(clampedStart, clampedEnd + 1).map((length) => {
      const clampedLength = direction > 0 ? Math.min(length, startLength + maxSpan) : Math.max(length, startLength - maxSpan);
      const sample = sampler.sampleAtLength(clampedLength);
      const angleDegrees = sample.angleDegrees + (flip ? 180 : 0);
      const anchor: TPoint = { x: pathCenter.x + sample.x, y: pathCenter.y + sample.y };
      const top = rotatePoint({ x: 0, y: -ascent }, ORIGIN, angleDegrees);
      const bottom = rotatePoint({ x: 0, y: descent }, ORIGIN, angleDegrees);

      return {
        bottom: { x: anchor.x + bottom.x, y: anchor.y + bottom.y },
        top: { x: anchor.x + top.x, y: anchor.y + top.y },
      };
    });
  }

  return [];
};
