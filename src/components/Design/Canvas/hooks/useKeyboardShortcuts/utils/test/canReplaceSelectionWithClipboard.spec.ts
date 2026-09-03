// utils
import { canReplaceSelectionWithClipboard } from '../canReplaceSelectionWithClipboard';

describe('canReplaceSelectionWithClipboard', () => {
  it('should return false when nothing is selected', () => {
    expect(canReplaceSelectionWithClipboard([], ['clip-a'])).toBe(false);
  });

  it('should return true when the clipboard holds a single root, regardless of selection size', () => {
    expect(canReplaceSelectionWithClipboard(['a'], ['clip-a'])).toBe(true);
    expect(canReplaceSelectionWithClipboard(['a', 'b', 'c'], ['clip-a'])).toBe(true);
  });

  it('should return true when the clipboard roots pair 1:1 with the selected targets', () => {
    expect(canReplaceSelectionWithClipboard(['a', 'b'], ['clip-a', 'clip-b'])).toBe(true);
  });

  it('should return false when the clipboard root count matches neither one-for-all nor a 1:1 pairing', () => {
    expect(canReplaceSelectionWithClipboard(['a', 'b', 'c'], ['clip-a', 'clip-b'])).toBe(false);
  });
});
