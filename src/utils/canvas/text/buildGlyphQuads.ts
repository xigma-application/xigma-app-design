// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { buildGlyphQuad } from './buildGlyphQuad';
import { getGlyph } from './getGlyph';
import { getGlyphAdvance } from './getGlyphAdvance';

export const buildGlyphQuads = (atlas: TGlyphAtlasJson, lines: string[], fontSize: number, originX: number, originY: number): number[] => {
  const scale = fontSize / atlas.info.size;
  const lineHeight = atlas.common.lineHeight * scale;
  const vertices: number[] = [];

  lines.forEach((line, lineIndex) => {
    let penX = originX;
    const penY = originY + lineIndex * lineHeight;

    line.split('').forEach((char) => {
      const charCode = char.charCodeAt(0);
      const glyph = getGlyph(atlas, charCode);

      if (glyph) {
        vertices.push(...buildGlyphQuad(glyph, penX, penY, scale, atlas.common.scaleW, atlas.common.scaleH));
      }

      penX += getGlyphAdvance(atlas, charCode, fontSize);
    });
  });

  return vertices;
};
