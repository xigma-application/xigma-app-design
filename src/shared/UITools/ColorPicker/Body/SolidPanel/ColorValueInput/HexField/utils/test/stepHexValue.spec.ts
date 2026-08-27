// utils
import { stepHexValue } from '../stepHexValue';

describe('stepHexValue', () => {
  it('should decrement a two-character pair when one character is selected', () => {
    // before
    const result = stepHexValue('ff9900', 0, 1, -1);

    // result
    expect(result).toEqual({ hex: 'fe9900', selectionEnd: 2, selectionStart: 0 });
  });

  it('should expand a three-character selection to the next full pair and step each byte independently', () => {
    // before
    const result = stepHexValue('ff9900', 0, 3, 1);

    // result
    expect(result).toEqual({ hex: 'ff9a00', selectionEnd: 4, selectionStart: 0 });
  });

  it('should expand a five-character selection to the whole value and step every byte at once', () => {
    // before
    const result = stepHexValue('ff9900', 0, 5, -1);

    // result
    expect(result).toEqual({ hex: 'fe9800', selectionEnd: 6, selectionStart: 0 });
  });

  it('should decrement through the same digits Figma shows for a two-character pair', () => {
    // before
    const first = stepHexValue('ff9900', 2, 4, -1);
    const second = stepHexValue(first.hex, 2, 4, -1);
    const third = stepHexValue(second.hex, 2, 4, -1);

    // result
    expect([first.hex, second.hex, third.hex]).toEqual(['ff9800', 'ff9700', 'ff9600']);
  });

  it('should clamp at 00 and not go negative', () => {
    // before
    const result = stepHexValue('000000', 0, 2, -1);

    // result
    expect(result).toEqual({ hex: '000000', selectionEnd: 2, selectionStart: 0 });
  });

  it('should clamp at ff and not overflow', () => {
    // before
    const result = stepHexValue('ffffff', 4, 6, 1);

    // result
    expect(result).toEqual({ hex: 'ffffff', selectionEnd: 6, selectionStart: 4 });
  });

  it('should keep the segment inside bounds when the cursor sits at the end with no selection', () => {
    // before
    const result = stepHexValue('ff9900', 6, 6, 1);

    // result
    expect(result).toEqual({ hex: 'ff9901', selectionEnd: 6, selectionStart: 4 });
  });

  it('should not expand an already even selection, even when it does not start at a pair boundary', () => {
    // before
    const result = stepHexValue('ff9900', 1, 5, 1);

    // result
    expect(result).toEqual({ hex: 'ffa910', selectionEnd: 5, selectionStart: 1 });
  });

  it('should step every byte in a full six-character selection independently, without carrying between them', () => {
    // before
    const result = stepHexValue('ff9900', 0, 6, 1);

    // result
    expect(result).toEqual({ hex: 'ff9a01', selectionEnd: 6, selectionStart: 0 });
  });

  it('should only extend an odd selection by one character to the right, without aligning to a pair boundary', () => {
    // before
    const result = stepHexValue('ff9900', 1, 2, 1);

    // result
    expect(result).toEqual({ hex: 'ffa900', selectionEnd: 3, selectionStart: 1 });
  });

  it('should clamp each byte independently instead of borrowing from the next one', () => {
    // before
    const result = stepHexValue('ff9900', 0, 6, -1);

    // result
    expect(result).toEqual({ hex: 'fe9800', selectionEnd: 6, selectionStart: 0 });
  });
});
