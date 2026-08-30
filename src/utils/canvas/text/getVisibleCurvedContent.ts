// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getCurvedGlyphBoundaries } from './getCurvedGlyphBoundaries';

export const getVisibleCurvedContent = (
  atlas: TGlyphAtlasJson,
  content: string,
  fontSize: number,
  startOffset: number,
  flip: boolean,
  pathLength: number,
  isClosed: boolean = true,
): string => {
  const boundaries = getCurvedGlyphBoundaries(atlas, content, fontSize, startOffset, flip, pathLength);
  const start = boundaries[0];
  let visibleLength = 0;

  for (let index = 1; index < boundaries.length; index++) {
    const boundary = boundaries[index];
    const overflows = isClosed ? Math.abs(boundary - start) > pathLength : boundary < 0 || boundary > pathLength;

    if (overflows) {
      break;
    }

    visibleLength = index;
  }

  return content.slice(0, visibleLength);
};
