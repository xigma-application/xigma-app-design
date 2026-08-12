// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getGlyphAdvance } from './getGlyphAdvance';

export const measureGlyphTextWidth = (atlas: TGlyphAtlasJson, text: string, fontSize: number): number =>
  text.split('').reduce((width, char) => width + getGlyphAdvance(atlas, char.charCodeAt(0), fontSize), 0);
