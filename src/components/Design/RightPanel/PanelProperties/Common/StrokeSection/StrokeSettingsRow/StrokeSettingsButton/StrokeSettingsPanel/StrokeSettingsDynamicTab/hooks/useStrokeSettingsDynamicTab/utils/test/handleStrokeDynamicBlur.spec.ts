import { FocusEvent } from 'react';

// utils
import { handleStrokeDynamicBlur } from '../handleStrokeDynamicBlur';

const blur = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('handleStrokeDynamicBlur', () => {
  it('should commit a changed value clamped to the field limits and show it with a percent sign', () => {
    // before
    const commit = vi.fn();
    const frequency = blur('5000');
    const wiggle = blur('60000%');

    // action
    handleStrokeDynamicBlur(frequency, 'frequency', 75, commit);
    handleStrokeDynamicBlur(wiggle, 'wiggle', 30, commit);

    // result
    expect(commit).toHaveBeenNthCalledWith(1, { strokeDynamicFrequency: 2000 });
    expect(commit).toHaveBeenNthCalledWith(2, { strokeDynamicWiggle: 60000 });
    expect(frequency.target.value).toBe('2000%');
    expect(wiggle.target.value).toBe('60000%');
  });

  it('should keep Smoothen within 0-100 and restore the field on invalid text without committing', () => {
    // before
    const commit = vi.fn();
    const smoothen = blur('250');
    const invalid = blur('nope');

    // action
    handleStrokeDynamicBlur(smoothen, 'smoothen', 50, commit);
    handleStrokeDynamicBlur(invalid, 'smoothen', 50, commit);

    // result
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith({ strokeDynamicSmoothen: 100 });
    expect(invalid.target.value).toBe('50%');
  });

  it('should not commit an unchanged value', () => {
    // before
    const commit = vi.fn();

    // action
    handleStrokeDynamicBlur(blur('30%'), 'wiggle', 30, commit);

    // result
    expect(commit).not.toHaveBeenCalled();
  });
});
