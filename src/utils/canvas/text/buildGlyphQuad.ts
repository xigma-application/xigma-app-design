// types
import { TGlyphChar } from 'types/msdf';

export const buildGlyphQuad = (
  glyph: TGlyphChar,
  penX: number,
  penY: number,
  scale: number,
  atlasWidth: number,
  atlasHeight: number,
): number[] => {
  const left = penX + glyph.xoffset * scale;
  const top = penY + glyph.yoffset * scale;
  const right = left + glyph.width * scale;
  const bottom = top + glyph.height * scale;

  const u0 = glyph.x / atlasWidth;
  const v0 = glyph.y / atlasHeight;
  const u1 = (glyph.x + glyph.width) / atlasWidth;
  const v1 = (glyph.y + glyph.height) / atlasHeight;

  // interleaved [x, y, u, v] per vertex, 2 triangles covering the glyph's quad
  return [left, top, u0, v0, right, top, u1, v0, right, bottom, u1, v1, left, top, u0, v0, right, bottom, u1, v1, left, bottom, u0, v1];
};
