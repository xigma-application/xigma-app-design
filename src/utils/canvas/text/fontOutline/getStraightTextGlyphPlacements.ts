// types
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode } from 'types/design/types';

// utils
import { getGlyph } from '../getGlyph';
import { getGlyphAdvance } from '../getGlyphAdvance';
import { getWrappedTextLines } from '../getWrappedTextLines';

export type TGlyphPlacement = { baselineY: number; char: string; penX: number };

export const getStraightTextGlyphPlacements = (atlas: TGlyphAtlasJson, node: TTextNode): TGlyphPlacement[] => {
  const lines = getWrappedTextLines(atlas, node.content, node.width, node.fontSize);
  const scale = node.fontSize / atlas.info.size;
  const lineHeight = atlas.common.lineHeight * scale;
  const baselineOffset = atlas.common.base * scale;

  return lines.flatMap((line, lineIndex) => {
    let penX = node.x;
    const baselineY = node.y + lineIndex * lineHeight + baselineOffset;

    return line.split('').flatMap((char) => {
      const charCode = char.charCodeAt(0);
      const placement: TGlyphPlacement[] = getGlyph(atlas, charCode) ? [{ baselineY, char, penX }] : [];

      penX += getGlyphAdvance(atlas, charCode, node.fontSize);

      return placement;
    });
  });
};
