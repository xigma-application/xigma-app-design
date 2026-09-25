import { FocusEvent } from 'react';

// utils
import { handleLineWeightBlur } from '../handleLineWeightBlur';

const blurEvent = (value: string): FocusEvent<HTMLInputElement> =>
  ({ target: { defaultValue: 'initial', value } }) as unknown as FocusEvent<HTMLInputElement>;

describe('handleLineWeightBlur', () => {
  it('should commit a new typed weight', () => {
    // mock
    const commit = vi.fn();

    // before
    handleLineWeightBlur(blurEvent('5'), 2, commit);

    // result
    expect(commit).toHaveBeenCalledWith(5);
  });

  it('should restore the field for an unchanged or invalid weight', () => {
    // mock
    const commit = vi.fn();
    const unchanged = blurEvent('2');
    const invalid = blurEvent('abc');

    // before
    handleLineWeightBlur(unchanged, 2, commit);
    handleLineWeightBlur(invalid, 2, commit);

    // result
    expect(commit).not.toHaveBeenCalled();
    expect(unchanged.target.value).toBe('initial');
    expect(invalid.target.value).toBe('initial');
  });
});
