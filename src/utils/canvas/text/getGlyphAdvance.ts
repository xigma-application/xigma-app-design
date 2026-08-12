// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getGlyph } from './getGlyph';

// v1 limitation: characters outside the baked charset (non-Latin scripts, emoji) fall back to an
// approximate average-glyph-width advance instead of crashing or rendering a replacement glyph
const FALLBACK_ADVANCE_RATIO = 0.6;

export const getGlyphAdvance = (atlas: TGlyphAtlasJson, charCode: number, fontSize: number): number => {
  const glyph = getGlyph(atlas, charCode);
  const scale = fontSize / atlas.info.size;

  return glyph ? glyph.xadvance * scale : fontSize * FALLBACK_ADVANCE_RATIO;
};
