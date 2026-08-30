// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { createEllipseTextPathSampler } from '../pathSampler/createEllipseTextPathSampler';
import { getCurvedSelectionRibbonVertices } from '../getCurvedSelectionRibbonVertices';

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

describe('getCurvedSelectionRibbonVertices', () => {
  it('should return an empty array for a collapsed selection', () => {
    // result
    expect(getCurvedSelectionRibbonVertices(ATLAS, 'AAA', 20, CENTER, 0, false, SAMPLER, 40, 1, 1)).toEqual([]);
  });

  it('should return one quad (6 vertices, 12 numbers) per selected character', () => {
    // before
    const vertices = getCurvedSelectionRibbonVertices(ATLAS, 'AAA', 20, CENTER, 0, false, SAMPLER, 40, 0, 2);

    // result — 2 selected characters -> 2 quads * 6 vertices * 2 numbers (x,y) each
    expect(vertices).toHaveLength(24);
  });

  it('should clamp the selection range to the content length', () => {
    // before
    const vertices = getCurvedSelectionRibbonVertices(ATLAS, 'AAA', 20, CENTER, 0, false, SAMPLER, 40, -5, 99);

    // result — 3 characters -> 3 quads
    expect(vertices).toHaveLength(36);
  });

  it('should reposition the ribbon when flipped', () => {
    // before
    const normal = getCurvedSelectionRibbonVertices(ATLAS, 'AAA', 20, CENTER, 0, false, SAMPLER, 40, 0, 1);
    const flipped = getCurvedSelectionRibbonVertices(ATLAS, 'AAA', 20, CENTER, 0, true, SAMPLER, 40, 0, 1);

    // result
    expect(flipped).not.toEqual(normal);
  });

  it('should share the exact boundary vertices between adjacent character quads, leaving no gap or overlap', () => {
    // before — 2 selected characters -> 2 quads, each built as [top_i, top_(i+1), bottom_(i+1), top_i, bottom_(i+1), bottom_i]
    const vertices = getCurvedSelectionRibbonVertices(ATLAS, 'AAA', 20, CENTER, 0, false, SAMPLER, 40, 0, 2);

    // result — the first quad's "top_(i+1)" vertex (offset 2-3) is the shared boundary with the
    // second quad's "top_i" vertex (offset 12-13, the start of the second quad's own 12 numbers)
    expect(vertices[2]).toBeCloseTo(vertices[12]);
    expect(vertices[3]).toBeCloseTo(vertices[13]);
  });

  it('should position later characters farther along the curve', () => {
    // before
    const vertices = getCurvedSelectionRibbonVertices(ATLAS, 'AAA', 20, CENTER, 0, false, SAMPLER, 40, 0, 3);

    // result — the first quad's own leading edge differs from the last quad's own leading edge
    expect([vertices[0], vertices[1]]).not.toEqual([vertices[24], vertices[25]]);
  });
});
