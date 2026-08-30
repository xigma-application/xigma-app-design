// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { buildCurvedGlyphQuads } from '../buildCurvedGlyphQuads';
import { createEllipseTextPathSampler } from '../pathSampler/createEllipseTextPathSampler';

const ATLAS: TGlyphAtlasJson = {
  chars: [{ height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 }],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

const CENTER = { x: 100, y: 100 };
const SAMPLER = createEllipseTextPathSampler({ height: 200, rotation: 0, width: 200, x: 0, y: 0 });

describe('buildCurvedGlyphQuads', () => {
  it('should return an empty array for empty content', () => {
    // result
    expect(buildCurvedGlyphQuads(ATLAS, '', 20, CENTER, 0, false, SAMPLER)).toEqual([]);
  });

  it('should build 6 interleaved [x, y, u, v] vertices for a single glyph', () => {
    // result
    expect(buildCurvedGlyphQuads(ATLAS, 'A', 20, CENTER, 0, false, SAMPLER)).toHaveLength(24);
  });

  it('should not emit vertices for characters outside the baked charset', () => {
    // before
    const withMissing = buildCurvedGlyphQuads(ATLAS, 'A?', 20, CENTER, 0, false, SAMPLER);
    const onlyA = buildCurvedGlyphQuads(ATLAS, 'A', 20, CENTER, 0, false, SAMPLER);

    // result — the trailing missing glyph never reaches the buffer
    expect(withMissing).toEqual(onlyA);
  });

  it('should still advance the cumulative path length for characters outside the baked charset', () => {
    // before
    const withLeadingMissing = buildCurvedGlyphQuads(ATLAS, '?A', 20, CENTER, 0, false, SAMPLER);
    const withoutLeadingMissing = buildCurvedGlyphQuads(ATLAS, 'A', 20, CENTER, 0, false, SAMPLER);

    // result
    expect(withLeadingMissing).toHaveLength(24);
    expect(withLeadingMissing).not.toEqual(withoutLeadingMissing);
  });

  it('should reposition the glyph when the flip orientation is enabled', () => {
    // before
    const normal = buildCurvedGlyphQuads(ATLAS, 'A', 20, CENTER, 0, false, SAMPLER);
    const flipped = buildCurvedGlyphQuads(ATLAS, 'A', 20, CENTER, 0, true, SAMPLER);

    // result
    expect(flipped).not.toEqual(normal);
  });

  it('should move the glyph along the path when startOffset changes', () => {
    // before
    const atStart = buildCurvedGlyphQuads(ATLAS, 'A', 20, CENTER, 0, false, SAMPLER);
    const atQuarter = buildCurvedGlyphQuads(ATLAS, 'A', 20, CENTER, 0.25, false, SAMPLER);

    // result
    expect(atQuarter).not.toEqual(atStart);
  });

  it('should anchor the glyph on its baseline (penY = -base·scale), so a taller base lifts the whole run', () => {
    // before — scale is 20/20 = 1, so bumping `base` by 5 must shift every glyph vertex by 5 units
    const withBase30 = buildCurvedGlyphQuads(ATLAS, 'A', 20, CENTER, 0, false, SAMPLER);
    const withBase35 = buildCurvedGlyphQuads({ ...ATLAS, common: { ...ATLAS.common, base: 35 } }, 'A', 20, CENTER, 0, false, SAMPLER);

    // result — the displacement is purely the baseline shift, same magnitude for every vertex
    expect(withBase35).not.toEqual(withBase30);

    for (let i = 0; i < withBase30.length; i += 4) {
      const dx = withBase35[i] - withBase30[i];
      const dy = withBase35[i + 1] - withBase30[i + 1];

      expect(Math.hypot(dx, dy)).toBeCloseTo(5);
    }
  });
});
