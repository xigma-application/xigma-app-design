// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getGlyph } from './getGlyph';

const FALLBACK_ADVANCE_RATIO = 0.6;

export const getGlyphAdvance = (atlas: TGlyphAtlasJson, charCode: number, fontSize: number): number => {
  const glyph = getGlyph(atlas, charCode);
  const scale = fontSize / atlas.info.size;

  return glyph ? glyph.xadvance * scale : fontSize * FALLBACK_ADVANCE_RATIO;
};
