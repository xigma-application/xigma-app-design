// utils
import { findLineIndexForOffset } from '../findLineIndexForOffset';

const LINES = [
  { startOffset: 0, text: 'hello' },
  { startOffset: 6, text: 'world' },
  { startOffset: 12, text: 'again' },
];

describe('findLineIndexForOffset', () => {
  it('should return the first line for an offset at the very start', () => {
    // result
    expect(findLineIndexForOffset(LINES, 0)).toBe(0);
  });

  it('should return the line an offset falls within', () => {
    // result
    expect(findLineIndexForOffset(LINES, 8)).toBe(1);
  });

  it('should return the last line for an offset past the end of all content', () => {
    // result
    expect(findLineIndexForOffset(LINES, 999)).toBe(2);
  });

  it('should resolve an offset landing exactly on a wrap-consumed separator to the preceding line', () => {
    // mock — offset 5 is the dropped space between "hello" and "world"; it sits right after "hello"
    // result
    expect(findLineIndexForOffset(LINES, 5)).toBe(0);
    expect(findLineIndexForOffset(LINES, 6)).toBe(1);
  });

  it('should return 0 for a single-line input', () => {
    // result
    expect(findLineIndexForOffset([{ startOffset: 0, text: 'solo' }], 2)).toBe(0);
  });
});
