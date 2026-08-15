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
  circumference: number,
): string => {
  const boundaries = getCurvedGlyphBoundaries(atlas, content, fontSize, startOffset, flip, circumference);
  const start = boundaries[0];
  let visibleLength = 0;

  for (let index = 1; index < boundaries.length; index++) {
    if (Math.abs(boundaries[index] - start) > circumference) {
      break;
    }

    visibleLength = index;
  }

  return content.slice(0, visibleLength);
};
