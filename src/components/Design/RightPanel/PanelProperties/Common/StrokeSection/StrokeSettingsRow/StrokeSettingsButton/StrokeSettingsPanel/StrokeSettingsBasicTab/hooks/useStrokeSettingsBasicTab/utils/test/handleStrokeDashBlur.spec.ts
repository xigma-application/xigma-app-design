import { FocusEvent } from 'react';

// utils
import { handleStrokeDashBlur } from '../handleStrokeDashBlur';

const blur = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('handleStrokeDashBlur', () => {
  it('should commit a changed dash length and show the parsed value', () => {
    // before
    const commit = vi.fn();
    const event = blur('8.456');

    // action
    handleStrokeDashBlur(event, 20, commit);

    // result
    expect(commit).toHaveBeenCalledWith({ strokeDash: 8.46 });
    expect(event.target.value).toBe('8.46');
  });

  it('should not commit an unchanged value and should restore the field on invalid text', () => {
    // before
    const commit = vi.fn();
    const invalid = blur('abc');

    // action
    handleStrokeDashBlur(blur('20'), 20, commit);
    handleStrokeDashBlur(invalid, 20, commit);

    // result
    expect(commit).not.toHaveBeenCalled();
    expect(invalid.target.value).toBe('20');
  });
});
