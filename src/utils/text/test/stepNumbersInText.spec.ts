// utils
import { stepNumbersInText } from '../stepNumbersInText';

describe('stepNumbersInText', () => {
  it('should step every number when the whole text is selected and select them afterwards', () => {
    // action
    const result = stepNumbersInText('8, 4, 6, 8', 0, 10, 1);

    // result
    expect(result).toEqual({ selectionEnd: 10, selectionStart: 0, text: '9, 5, 7, 9' });
  });

  it('should step only the number under a collapsed caret', () => {
    // action
    const result = stepNumbersInText('8, 4, 6, 8', 4, 4, 1);

    // result
    expect(result).toEqual({ selectionEnd: 4, selectionStart: 3, text: '8, 5, 6, 8' });
  });

  it('should step the number nearest to a caret sitting on a separator', () => {
    // action
    const result = stepNumbersInText('8, 4', 2, 2, 1);

    // result
    expect(result?.text).toBe('9, 4');
  });

  it('should step only the numbers touched by a partial selection', () => {
    // action
    const result = stepNumbersInText('8, 4, 6, 8', 3, 7, -1);

    // result
    expect(result).toEqual({ selectionEnd: 7, selectionStart: 3, text: '8, 3, 5, 8' });
  });

  it('should follow the changed text length and clamp to min and max', () => {
    // action
    const grown = stepNumbersInText('9, 4', 0, 4, 1);
    const clamped = stepNumbersInText('0, 4', 0, 4, -1, { min: 0 });
    const capped = stepNumbersInText('9', 0, 1, 5, { max: 10 });

    // result
    expect(grown).toEqual({ selectionEnd: 5, selectionStart: 0, text: '10, 5' });
    expect(clamped?.text).toBe('0, 3');
    expect(capped?.text).toBe('10');
  });

  it('should return null when there is no number', () => {
    // result
    expect(stepNumbersInText('abc', 0, 3, 1)).toBeNull();
  });
});
