import { FocusEvent } from 'react';

// utils
import { handleStrokeGapBlur } from '../handleStrokeGapBlur';

const blur = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('handleStrokeGapBlur', () => {
  it('should commit a changed gap length and show the parsed value', () => {
    // before
    const commit = vi.fn();
    const event = blur('3');

    // action
    handleStrokeGapBlur(event, 20, commit);

    // result
    expect(commit).toHaveBeenCalledWith({ strokeGap: 3 });
    expect(event.target.value).toBe('3');
  });

  it('should not commit an unchanged value and should restore the field on invalid text', () => {
    // before
    const commit = vi.fn();
    const invalid = blur('');

    // action
    handleStrokeGapBlur(blur('20'), 20, commit);
    handleStrokeGapBlur(invalid, 20, commit);

    // result
    expect(commit).not.toHaveBeenCalled();
    expect(invalid.target.value).toBe('20');
  });
});
