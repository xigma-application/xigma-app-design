import { FocusEvent } from 'react';

// utils
import { handleStrokeBrushScatterBlur } from '../handleStrokeBrushScatterBlur';

const blur = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('handleStrokeBrushScatterBlur', () => {
  it('should commit a clamped value and show it with its unit', () => {
    // before
    const commit = vi.fn();
    const sizeJitter = blur('250');
    const angular = blur('999°');

    // action
    handleStrokeBrushScatterBlur(sizeJitter, 'sizeJitter', 0, commit);
    handleStrokeBrushScatterBlur(angular, 'angularJitter', 180, commit);

    // result
    expect(commit).toHaveBeenCalledWith({ strokeBrushSizeJitter: 100 });
    expect(sizeJitter.target.value).toBe('100%');
    expect(angular.target.value).toBe('180°');
  });

  it('should keep Gap and Wiggle unbounded above but Gap at least 1%', () => {
    // before
    const commit = vi.fn();

    // action
    handleStrokeBrushScatterBlur(blur('60000%'), 'wiggle', 0, commit);
    handleStrokeBrushScatterBlur(blur('0'), 'gap', 45, commit);

    // result
    expect(commit).toHaveBeenNthCalledWith(1, { strokeBrushWiggle: 60000 });
    expect(commit).toHaveBeenNthCalledWith(2, { strokeBrushGap: 1 });
  });

  it('should restore the field on invalid text and not commit an unchanged value', () => {
    // before
    const commit = vi.fn();
    const invalid = blur('nope');

    // action
    handleStrokeBrushScatterBlur(invalid, 'gap', 45, commit);
    handleStrokeBrushScatterBlur(blur('45%'), 'gap', 45, commit);

    // result
    expect(commit).not.toHaveBeenCalled();
    expect(invalid.target.value).toBe('45%');
  });
});
