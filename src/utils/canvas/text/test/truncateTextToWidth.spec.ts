// utils
import { getTextWidth } from '../getTextWidth';
import { truncateTextToWidth } from '../truncateTextToWidth';

const FONT_SIZE = 12;

describe('truncateTextToWidth', () => {
  it('should return the text unchanged when it already fits', () => {
    // result
    expect(truncateTextToWidth('Frame 1', getTextWidth('Frame 1', FONT_SIZE), FONT_SIZE)).toBe('Frame 1');
  });

  it('should shorten text that overflows, appending an ellipsis', () => {
    // before
    const full = 'A very long frame name';
    const maxWidth = getTextWidth('A very', FONT_SIZE);

    // result
    const truncated = truncateTextToWidth(full, maxWidth, FONT_SIZE);

    expect(truncated.endsWith('…')).toBe(true);
    expect(truncated.length).toBeLessThan(full.length);
    expect(getTextWidth(truncated, FONT_SIZE)).toBeLessThanOrEqual(maxWidth);
  });

  it('should shrink further as the available width shrinks', () => {
    // before
    const full = 'A very long frame name';

    // result
    const wide = truncateTextToWidth(full, getTextWidth('A very long', FONT_SIZE), FONT_SIZE);
    const narrow = truncateTextToWidth(full, getTextWidth('A ver', FONT_SIZE), FONT_SIZE);

    expect(narrow.length).toBeLessThan(wide.length);
  });

  it('should fall back to a bare ellipsis when even one character does not fit', () => {
    // result
    expect(truncateTextToWidth('Frame 1', 1, FONT_SIZE)).toBe('…');
  });
});
