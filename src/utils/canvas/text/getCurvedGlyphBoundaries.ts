// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getGlyphAdvance } from './getGlyphAdvance';

export const getCurvedGlyphBoundaries = (
  atlas: TGlyphAtlasJson,
  content: string,
  fontSize: number,
  startOffset: number,
  flip: boolean,
  pathLength: number,
): number[] => {
  const direction = flip ? -1 : 1;
  const boundaries: number[] = [startOffset * pathLength];

  content.split('').forEach((char, index) => {
    const advance = getGlyphAdvance(atlas, char.charCodeAt(0), fontSize);

    boundaries.push(boundaries[index] + direction * advance);
  });

  return boundaries;
};
