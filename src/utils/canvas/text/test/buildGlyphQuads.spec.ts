// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { buildGlyphQuads } from '../buildGlyphQuads';

const ATLAS: TGlyphAtlasJson = {
  chars: [
    { height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 },
    { height: 10, id: 66, width: 8, x: 8, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 },
  ],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

describe('buildGlyphQuads', () => {
  it('should emit 24 numbers (one quad) per known glyph on a single line', () => {
    // result — "AB" is two known glyphs, 6 vertices * 4 floats each
    expect(buildGlyphQuads(ATLAS, ['AB'], 20, 0, 0)).toHaveLength(48);
  });

  it('should offset each subsequent line down by the scaled line height', () => {
    // before
    const vertices = buildGlyphQuads(ATLAS, ['A', 'B'], 20, 0, 0);

    // result — the second line's first vertex "top" (index 1 within its 24-number quad, which
    // starts right after the first line's single 24-number quad) is offset by lineHeight (40)
    expect(vertices[25]).toBe(42);
  });

  it('should skip emitting a quad for a character outside the baked charset, while still advancing the pen', () => {
    // before — '?' (id 63) has no glyph in the fixture atlas
    const withMissingGlyph = buildGlyphQuads(ATLAS, ['A?B'], 20, 0, 0);
    const withoutMissingGlyph = buildGlyphQuads(ATLAS, ['AB'], 20, 0, 0);

    // result — only 2 quads emitted (missing glyph contributes no vertices)...
    expect(withMissingGlyph).toHaveLength(48);

    // ...but B's quad starts further right than in the no-gap case, since the pen still
    // advanced by the missing glyph's fallback width
    expect(withMissingGlyph[24]).toBeGreaterThan(withoutMissingGlyph[24]);
  });
});
