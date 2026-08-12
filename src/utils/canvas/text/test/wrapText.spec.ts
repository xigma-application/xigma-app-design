// utils
import { wrapText } from '../wrapText';

// each character measures 10 units wide, so width thresholds are easy to reason about
const measureWidth = (text: string): number => text.length * 10;

describe('wrapText', () => {
  it('should keep a single short word on one line', () => {
    // result
    expect(wrapText(measureWidth, 'hello', 100)).toEqual(['hello']);
  });

  it('should wrap to a new line once the next word would overflow maxWidth', () => {
    // result — "hello world" is 110 units wide, over the 100-unit budget
    expect(wrapText(measureWidth, 'hello world', 100)).toEqual(['hello', 'world']);
  });

  it('should pack as many words as fit before wrapping', () => {
    // result — "one two" is 70 units (fits in 80), adding "three" would push past it
    expect(wrapText(measureWidth, 'one two three', 80)).toEqual(['one two', 'three']);
  });

  it('should break a single word with no spaces mid-word once it alone exceeds maxWidth, matching overflow-wrap: break-word', () => {
    // result — 20 chars at 10 units each, breaking every 5 chars (50-unit budget)
    expect(wrapText(measureWidth, 'supercalifragilistic', 50)).toEqual(['super', 'calif', 'ragil', 'istic']);
  });

  it('should wrap normally at the preceding space, then keep breaking mid-word for the oversized word that follows', () => {
    // result
    expect(wrapText(measureWidth, 'hi supercalifragilistic', 50)).toEqual(['hi', 'super', 'calif', 'ragil', 'istic']);
  });

  it('should treat an explicit newline as a forced line break, regardless of width', () => {
    // result
    expect(wrapText(measureWidth, 'hi\nthere', 1000)).toEqual(['hi', 'there']);
  });

  it('should preserve a blank line from consecutive newlines', () => {
    // result
    expect(wrapText(measureWidth, 'hi\n\nthere', 1000)).toEqual(['hi', '', 'there']);
  });

  it('should return a single blank line for empty content', () => {
    // result
    expect(wrapText(measureWidth, '', 100)).toEqual(['']);
  });
});
