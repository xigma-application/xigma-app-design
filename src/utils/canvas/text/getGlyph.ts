// types
import { TGlyphAtlasJson, TGlyphChar } from 'types/msdf';

export const getGlyph = (atlas: TGlyphAtlasJson, charCode: number): TGlyphChar | undefined =>
  atlas.chars.find((glyph) => glyph.id === charCode);
