// types
import { TWrappedLine } from '../wrapTextWithOffsets';

// utils
import { advanceLine } from '../advanceLine';

describe('advanceLine', () => {
  it('should keep accumulating the candidate onto the current line when it does not exceed maxWidth', () => {
    // before
    const result = advanceLine([], 'hel', 0, -1, -1, 3, 'hell', 'l', false);

    // result
    expect(result).toEqual({ currentLine: 'hell', currentLineStart: 0, lastSpaceIndex: -1 });
  });

  it('should break at the last space and carry the remainder plus the new char into the next line', () => {
    // mock
    const lines: TWrappedLine[] = [];

    // before
    const result = advanceLine(lines, 'hello worl', 0, 5, 5, 10, 'hello world', 'd', true);

    // result
    expect(lines).toEqual([{ startOffset: 0, text: 'hello' }]);
    expect(result).toEqual({ currentLine: 'world', currentLineStart: 6, lastSpaceIndex: -1 });
  });

  it('should break mid-word at the current char when there is no preceding space to break at', () => {
    // mock
    const lines: TWrappedLine[] = [];

    // before
    const result = advanceLine(lines, 'super', 0, -1, -1, 5, 'superc', 'c', true);

    // result
    expect(lines).toEqual([{ startOffset: 0, text: 'super' }]);
    expect(result).toEqual({ currentLine: 'c', currentLineStart: 5, lastSpaceIndex: -1 });
  });

  it('should anchor a broken line at its own currentLineStart, not at offset 0', () => {
    // mock
    const lines: TWrappedLine[] = [];

    // before
    advanceLine(lines, 'world', 6, -1, -1, 11, 'worldx', 'x', true);

    // result
    expect(lines).toEqual([{ startOffset: 6, text: 'world' }]);
  });
});
