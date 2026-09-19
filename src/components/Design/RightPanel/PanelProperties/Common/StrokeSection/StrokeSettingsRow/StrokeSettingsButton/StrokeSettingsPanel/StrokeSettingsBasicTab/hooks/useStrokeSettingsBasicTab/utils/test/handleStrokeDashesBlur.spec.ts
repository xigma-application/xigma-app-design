import { FocusEvent } from 'react';

// utils
import { handleStrokeDashesBlur } from '../handleStrokeDashesBlur';

const blur = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('handleStrokeDashesBlur', () => {
  it('should commit a changed list and show it normalised', () => {
    // before
    const commit = vi.fn();
    const event = blur('10 20,5   20');

    // action
    handleStrokeDashesBlur(event, [20, 40, 60, 80], commit);

    // result
    expect(commit).toHaveBeenCalledWith({ strokeDashes: [10, 20, 5, 20] });
    expect(event.target.value).toBe('10, 20, 5, 20');
  });

  it('should not commit an unchanged list and should restore the field on invalid text', () => {
    // before
    const commit = vi.fn();
    const invalid = blur('nope');

    // action
    handleStrokeDashesBlur(blur('20, 40'), [20, 40], commit);
    handleStrokeDashesBlur(invalid, [20, 40], commit);

    // result
    expect(commit).not.toHaveBeenCalled();
    expect(invalid.target.value).toBe('20, 40');
  });
});
