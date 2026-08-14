// types
import { TEditingTextBox } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getCurvedCaretIndexAtPoint } from '../getCurvedCaretIndexAtPoint';

const ATLAS: TGlyphAtlasJson = {
  chars: [{ height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 }],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

// a 200x200 circle centered at (100, 100) — its rightmost point is offset 0, its bottom is offset 0.25
const BOX: TEditingTextBox = { flipX: false, flipY: false, height: 200, rotation: 0, width: 200, x: 0, y: 0 };
const RIGHT = { x: 200, y: 100 };
const BOTTOM = { x: 100, y: 200 };

describe('getCurvedCaretIndexAtPoint', () => {
  it("should return index 0 with ~zero distance for a point at the content's start on the path", () => {
    // result
    expect(getCurvedCaretIndexAtPoint(ATLAS, 'AAAAAAAA', 20, { ...BOX, pathStartOffset: 0 }, RIGHT)).toEqual({
      distance: expect.closeTo(0, 5),
      index: 0,
    });
  });

  it('should clamp to the last index and report the overshoot as distance when the point is farther along the path than the content reaches', () => {
    // before — content only spans 96 units, far short of the quarter-turn (~157) to the bottom point
    const hit = getCurvedCaretIndexAtPoint(ATLAS, 'AAAAAAAA', 20, { ...BOX, pathStartOffset: 0 }, BOTTOM);

    // result
    expect(hit.index).toBe(8);
    expect(hit.distance).toBeCloseTo(61.08, 1);
  });

  it('should shift the hit-test range along the path by pathStartOffset', () => {
    // result — content now starts exactly where the bottom point sits on the path
    expect(getCurvedCaretIndexAtPoint(ATLAS, 'AAAAAAAA', 20, { ...BOX, pathStartOffset: 0.25 }, BOTTOM)).toEqual({
      distance: expect.closeTo(0, 5),
      index: 0,
    });
  });

  it('should walk the boundaries in the opposite direction for the same point when pathFlip is true', () => {
    // before
    const forward = getCurvedCaretIndexAtPoint(ATLAS, 'AAAA', 20, { ...BOX, pathFlip: false, pathStartOffset: 0.2 }, BOTTOM);
    const flipped = getCurvedCaretIndexAtPoint(ATLAS, 'AAAA', 20, { ...BOX, pathFlip: true, pathStartOffset: 0.2 }, BOTTOM);

    // result
    expect(forward).toEqual({ distance: expect.closeTo(0, 5), index: 3 });
    expect(flipped).toEqual({ distance: expect.closeTo(31.42, 1), index: 0 });
  });

  it('should default pathStartOffset to 0 when the box omits it', () => {
    // result
    expect(getCurvedCaretIndexAtPoint(ATLAS, 'AAAAAAAA', 20, BOX, RIGHT)).toEqual({
      distance: expect.closeTo(0, 5),
      index: 0,
    });
  });

  it('should hit-test across the wraparound seam when the nearer boundary lies past the circumference', () => {
    // result — pathStartOffset near the end of the loop, clicked point sits just after wrapping back to the start
    expect(getCurvedCaretIndexAtPoint(ATLAS, 'AA', 20, { ...BOX, pathStartOffset: 0.99 }, RIGHT)).toEqual({
      distance: expect.closeTo(0, 5),
      index: 1,
    });
  });
});
