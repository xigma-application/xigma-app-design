// utils
import { stepCssValue } from '../stepCssValue';

describe('stepCssValue', () => {
  it('should step only rgb, leaving alpha untouched, when everything is selected', () => {
    // before
    const result = stepCssValue('rgba(13, 153, 200, 0.5)', 0, 23, 1);

    // result
    expect(result).toEqual({ selectionEnd: 17, selectionStart: 5, value: 'rgba(14, 154, 201, 0.5)' });
  });

  it('should select the whole token under the cursor when nothing is selected', () => {
    // before
    const result = stepCssValue('rgba(13, 153, 255, 1)', 6, 6, 1);

    // result
    expect(result).toEqual({ selectionEnd: 7, selectionStart: 5, value: 'rgba(14, 153, 255, 1)' });
  });

  it('should step only r and g together when the selection spans just those two tokens', () => {
    // before
    const result = stepCssValue('rgba(13, 153, 255, 1)', 5, 12, 1);

    // result
    expect(result).toEqual({ selectionEnd: 12, selectionStart: 5, value: 'rgba(14, 154, 255, 1)' });
  });

  it('should step only g and b together when the selection spans just those two tokens', () => {
    // before
    const result = stepCssValue('rgba(13, 153, 255, 1)', 9, 17, -1);

    // result
    expect(result).toEqual({ selectionEnd: 17, selectionStart: 9, value: 'rgba(13, 152, 254, 1)' });
  });

  it('should step b and alpha together when the selection spans across the comma into alpha', () => {
    // before
    const result = stepCssValue('rgba(13, 153, 255, 1)', 15, 20, -1);

    // result
    expect(result).toEqual({ selectionEnd: 23, selectionStart: 14, value: 'rgba(13, 153, 254, 0.99)' });
  });

  it('should step alpha by 0.01 per press', () => {
    // before
    const result = stepCssValue('rgba(13, 153, 255, 0.5)', 19, 22, 1);

    // result
    expect(result).toEqual({ selectionEnd: 23, selectionStart: 19, value: 'rgba(13, 153, 255, 0.51)' });
  });

  it('should clamp a channel at 255 and not overflow', () => {
    // before
    const result = stepCssValue('rgba(255, 0, 0, 1)', 5, 8, 1);

    // result
    expect(result).toEqual({ selectionEnd: 8, selectionStart: 5, value: 'rgba(255, 0, 0, 1)' });
  });

  it('should clamp alpha at 1 and not overflow', () => {
    // before
    const result = stepCssValue('rgba(255, 0, 0, 1)', 16, 17, 1);

    // result
    expect(result).toEqual({ selectionEnd: 17, selectionStart: 16, value: 'rgba(255, 0, 0, 1)' });
  });

  it('should fall back to the last token when the cursor sits past every token', () => {
    // before
    const result = stepCssValue('rgba(13, 153, 255, 1)', 21, 21, 1);

    // result
    expect(result).toEqual({ selectionEnd: 20, selectionStart: 19, value: 'rgba(13, 153, 255, 1)' });
  });

  it('should return null for an unparsable value', () => {
    // before
    const result = stepCssValue('not a color', 0, 3, 1);

    // result
    expect(result).toBeNull();
  });
});
