// utils
import { wrapTextWithOffsets } from '../wrapTextWithOffsets';

const measureWidth = (text: string): number => text.length * 10;

describe('wrapTextWithOffsets', () => {
  it('should keep a single short word on one line, starting at offset 0', () => {
    // result
    expect(wrapTextWithOffsets(measureWidth, 'hello', 100)).toEqual([{ startOffset: 0, text: 'hello' }]);
  });

  it('should drop the wrap-triggering space from both lines and start the next line right after it', () => {
    // result — "hello world" is 110 units wide, over the 100-unit budget; the space at index 5 is consumed
    expect(wrapTextWithOffsets(measureWidth, 'hello world', 100)).toEqual([
      { startOffset: 0, text: 'hello' },
      { startOffset: 6, text: 'world' },
    ]);
  });

  it('should pack as many words as fit before wrapping', () => {
    // result — "one two" (7 chars) fits in 80; "three" starts right after the second space at index 8
    expect(wrapTextWithOffsets(measureWidth, 'one two three', 80)).toEqual([
      { startOffset: 0, text: 'one two' },
      { startOffset: 8, text: 'three' },
    ]);
  });

  it('should not drop any characters when breaking mid-word (no separator to consume)', () => {
    // result — 20 chars at 10 units each, breaking every 5 chars (50-unit budget), no gaps between offsets
    expect(wrapTextWithOffsets(measureWidth, 'supercalifragilistic', 50)).toEqual([
      { startOffset: 0, text: 'super' },
      { startOffset: 5, text: 'calif' },
      { startOffset: 10, text: 'ragil' },
      { startOffset: 15, text: 'istic' },
    ]);
  });

  it('should wrap normally at the preceding space, then keep breaking mid-word with no gaps for the oversized word', () => {
    // result — "hi" (0-1), space at 2 consumed, then the 20-char word breaks every 5 chars from offset 3
    expect(wrapTextWithOffsets(measureWidth, 'hi supercalifragilistic', 50)).toEqual([
      { startOffset: 0, text: 'hi' },
      { startOffset: 3, text: 'super' },
      { startOffset: 8, text: 'calif' },
      { startOffset: 13, text: 'ragil' },
      { startOffset: 18, text: 'istic' },
    ]);
  });

  it('should treat an explicit newline as a forced line break, consuming exactly the newline character', () => {
    // result — "hi" (0-1), '\n' at 2 consumed, "there" starts at 3
    expect(wrapTextWithOffsets(measureWidth, 'hi\nthere', 1000)).toEqual([
      { startOffset: 0, text: 'hi' },
      { startOffset: 3, text: 'there' },
    ]);
  });

  it('should preserve a blank line from consecutive newlines, at its own offset', () => {
    // result
    expect(wrapTextWithOffsets(measureWidth, 'hi\n\nthere', 1000)).toEqual([
      { startOffset: 0, text: 'hi' },
      { startOffset: 3, text: '' },
      { startOffset: 4, text: 'there' },
    ]);
  });

  it('should return a single blank line at offset 0 for empty content', () => {
    // result
    expect(wrapTextWithOffsets(measureWidth, '', 100)).toEqual([{ startOffset: 0, text: '' }]);
  });
});
