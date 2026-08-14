// types
import { TEditingTextBox } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getStraightCaretIndexAtPoint } from '../getStraightCaretIndexAtPoint';

const ATLAS: TGlyphAtlasJson = {
  chars: [{ height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 }],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

const BOX: TEditingTextBox = { flipX: false, flipY: false, height: 100, rotation: 0, width: 300, x: 0, y: 0 };

describe('getStraightCaretIndexAtPoint', () => {
  it('should return index 0 with zero distance at the start of an unrotated line', () => {
    // result
    expect(getStraightCaretIndexAtPoint(ATLAS, 'AAAA', 20, BOX, { x: 0, y: 0 })).toEqual({ distance: 0, index: 0 });
  });

  it('should return the nearest character boundary partway through an unrotated line', () => {
    // result — column boundaries at 0,12,24,36,48; 18 sits equidistant, so it snaps to the first found
    expect(getStraightCaretIndexAtPoint(ATLAS, 'AAAA', 20, BOX, { x: 18, y: 0 })).toEqual({ distance: 0, index: 1 });
  });

  it('should reverse which end of the content a click lands on when the box is rotated 180 degrees', () => {
    // before — a 180-degree box turns its own bottom-right corner into where the first character now renders
    const start = getStraightCaretIndexAtPoint(ATLAS, 'AAAA', 20, { ...BOX, rotation: 180 }, { x: 300, y: 100 });
    const end = getStraightCaretIndexAtPoint(ATLAS, 'AAAA', 20, { ...BOX, rotation: 180 }, { x: 252, y: 100 });

    // result
    expect(start).toEqual({ distance: expect.closeTo(0, 5), index: 0 });
    expect(end).toEqual({ distance: expect.closeTo(0, 5), index: 4 });
  });

  it('should reverse which end of the content a click lands on when the box is flipped horizontally', () => {
    // before
    const nearVisualLeftEdge = getStraightCaretIndexAtPoint(ATLAS, 'AAAA', 20, { ...BOX, flipX: true }, { x: 2, y: 0 });
    const nearVisualRightEdge = getStraightCaretIndexAtPoint(ATLAS, 'AAAA', 20, { ...BOX, flipX: true }, { x: 298, y: 0 });

    // result
    expect(nearVisualLeftEdge.index).toBe(4);
    expect(nearVisualRightEdge.index).toBe(0);
  });

  it("should pick the wrapped line under the click and offset the index by that line's startOffset", () => {
    // result — "AA" (2 chars) + "\n" (1) puts line 1 ("BB") at startOffset 3; lineHeight is 40, so y=45 is line 1
    expect(getStraightCaretIndexAtPoint(ATLAS, 'AA\nBB', 20, BOX, { x: 0, y: 45 })).toEqual({ distance: 0, index: 3 });
  });

  it('should clamp to the last line when the click lands below all content', () => {
    // before
    const hit = getStraightCaretIndexAtPoint(ATLAS, 'AA\nBB', 20, BOX, { x: 0, y: 999 });

    // result
    expect(hit.index).toBe(3);
    expect(hit.distance).toBeGreaterThan(0);
  });

  it('should report a nonzero distance for a click outside the box entirely', () => {
    // result
    expect(getStraightCaretIndexAtPoint(ATLAS, 'AA', 20, BOX, { x: -50, y: -50 }).distance).toBeCloseTo(70.71, 1);
  });
});
