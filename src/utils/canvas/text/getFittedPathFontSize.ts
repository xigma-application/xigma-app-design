// others
import { PATH_TEXT_MIN_FONT_SIZE } from 'constant/canvas';

// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { measureGlyphTextWidth } from './measureGlyphTextWidth';

export const getFittedPathFontSize = (
  atlas: TGlyphAtlasJson,
  content: string,
  authoredFontSize: number,
  availableLength: number,
  minFontSize: number = PATH_TEXT_MIN_FONT_SIZE,
): number => {
  const unitWidth = measureGlyphTextWidth(atlas, content, 1);
  let fittedFontSize = authoredFontSize;

  if (unitWidth > 0) {
    fittedFontSize = Math.max(minFontSize, Math.min(authoredFontSize, availableLength / unitWidth));
  }

  return fittedFontSize;
};
