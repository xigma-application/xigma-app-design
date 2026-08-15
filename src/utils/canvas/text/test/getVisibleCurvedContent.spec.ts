// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getVisibleCurvedContent } from '../getVisibleCurvedContent';

const ATLAS: TGlyphAtlasJson = {
  chars: [{ height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 }],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

describe('getVisibleCurvedContent', () => {
  it('should return the full content unchanged when it fits within the circumference', () => {
    // result — 2 "A"s advance 12 each, well within a 100-unit circumference
    expect(getVisibleCurvedContent(ATLAS, 'AA', 20, 0, false, 100)).toBe('AA');
  });

  it('should drop the overflowing characters once the content advances past a full turn', () => {
    // result — 10 "A"s would advance 120 units, but only the first 8 (96 units) fit within 100
    expect(getVisibleCurvedContent(ATLAS, 'AAAAAAAAAA', 20, 0, false, 100)).toBe('AAAAAAAA');
  });

  it('should keep exactly the characters that land precisely at the circumference boundary', () => {
    // result — 8 "A"s advance exactly 96 units, still within the 96-unit circumference
    expect(getVisibleCurvedContent(ATLAS, 'AAAAAAAA', 20, 0, false, 96)).toBe('AAAAAAAA');
  });

  it('should measure the available span relative to its own starting point, not the absolute arc-length origin', () => {
    // before — a full circumference of room is available no matter where along the path the
    // content actually starts
    const visible = getVisibleCurvedContent(ATLAS, 'AAAAAAAAAA', 20, 0.5, false, 100);

    // result — same cutoff (8 characters) as starting at offset 0
    expect(visible).toBe('AAAAAAAA');
  });

  it('should measure the traveled distance correctly when walking backwards (flipped)', () => {
    // result — same overflow math applies regardless of direction
    expect(getVisibleCurvedContent(ATLAS, 'AAAAAAAAAA', 20, 0, true, 100)).toBe('AAAAAAAA');
  });

  it('should return an empty string for empty content', () => {
    // result
    expect(getVisibleCurvedContent(ATLAS, '', 20, 0, false, 100)).toBe('');
  });
});
