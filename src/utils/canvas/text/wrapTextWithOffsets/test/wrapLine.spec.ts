// utils
import { wrapLine } from '../wrapLine';

// each character measures 10 units wide, so width thresholds are easy to reason about
const measureWidth = (text: string): number => text.length * 10;

describe('wrapLine', () => {
  it('should keep a short line on a single wrapped line, anchored at startOffset', () => {
    // before
    const result = wrapLine(measureWidth, 'hello', 100, 0);

    // result
    expect(result.lines).toEqual([{ startOffset: 0, text: 'hello' }]);
    expect(result.endOffset).toBe(5);
  });

  it('should wrap at the last space once the next char would overflow maxWidth', () => {
    // before
    const result = wrapLine(measureWidth, 'hello world', 100, 0);

    // result
    expect(result.lines).toEqual([
      { startOffset: 0, text: 'hello' },
      { startOffset: 6, text: 'world' },
    ]);
  });

  it('should break mid-word with no gaps between offsets when a single word exceeds maxWidth', () => {
    // before
    const result = wrapLine(measureWidth, 'supercalifragilistic', 50, 0);

    // result
    expect(result.lines).toEqual([
      { startOffset: 0, text: 'super' },
      { startOffset: 5, text: 'calif' },
      { startOffset: 10, text: 'ragil' },
      { startOffset: 15, text: 'istic' },
    ]);
  });

  it('should offset every returned line by the given startOffset', () => {
    // before
    const result = wrapLine(measureWidth, 'hello world', 100, 10);

    // result
    expect(result.lines).toEqual([
      { startOffset: 10, text: 'hello' },
      { startOffset: 16, text: 'world' },
    ]);
    expect(result.endOffset).toBe(21);
  });

  it('should return a single blank line for empty content, without advancing the offset', () => {
    // before
    const result = wrapLine(measureWidth, '', 100, 3);

    // result
    expect(result.lines).toEqual([{ startOffset: 3, text: '' }]);
    expect(result.endOffset).toBe(3);
  });
});
