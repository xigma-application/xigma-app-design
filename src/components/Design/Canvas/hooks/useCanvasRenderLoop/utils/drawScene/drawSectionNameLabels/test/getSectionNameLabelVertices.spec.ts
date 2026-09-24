// utils
import { getSectionNameLabelVertices } from '../getSectionNameLabelVertices';

describe('getSectionNameLabelVertices', () => {
  it('should build glyph vertices inside the badge padding and reuse them for the same badge and zoom', () => {
    // mock
    const badge = { height: 20, text: 'Section', textHeight: 12, width: 80, x: 100, y: 50 };

    // before
    const first = getSectionNameLabelVertices(badge, 1);

    // result
    expect(first).not.toBeNull();
    expect(first?.length).toBeGreaterThan(0);
    expect(getSectionNameLabelVertices(badge, 1)).toBe(first);
    expect(getSectionNameLabelVertices(badge, 2)).not.toBe(first);
  });

  it('should be null when the text produces no glyphs', () => {
    // result
    expect(getSectionNameLabelVertices({ height: 4, text: '', textHeight: 0, width: 4, x: 0, y: 0 }, 1)).toBeNull();
  });
});
