// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { measureGlyphTextWidth } from './measureGlyphTextWidth';
import { wrapText } from './wrapText';

export const getWrappedTextLines = (atlas: TGlyphAtlasJson, content: string, width: number, fontSize: number): string[] =>
  wrapText((text) => measureGlyphTextWidth(atlas, text, fontSize), content, width);
