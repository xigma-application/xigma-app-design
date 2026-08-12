// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getWrappedTextLines } from './getWrappedTextLines';
import { measureGlyphTextWidth } from './measureGlyphTextWidth';

export const getTextLineWidths = (atlas: TGlyphAtlasJson, content: string, wrapWidth: number, fontSize: number): number[] => {
  const lines = getWrappedTextLines(atlas, content, wrapWidth, fontSize);

  return lines.map((line) => measureGlyphTextWidth(atlas, line, fontSize));
};
