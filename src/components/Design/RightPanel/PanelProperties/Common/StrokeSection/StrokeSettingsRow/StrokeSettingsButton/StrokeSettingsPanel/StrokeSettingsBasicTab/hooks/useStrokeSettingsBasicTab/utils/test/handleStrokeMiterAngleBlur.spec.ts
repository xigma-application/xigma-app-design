import { FocusEvent } from 'react';

// utils
import { handleStrokeMiterAngleBlur } from '../handleStrokeMiterAngleBlur';

const blur = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('handleStrokeMiterAngleBlur', () => {
  it('should commit a changed angle clamped to the 7.17-180 range and show it with a degree sign', () => {
    // before
    const commit = vi.fn();
    const tooBig = blur('500°');
    const tooSmall = blur('1');

    // action
    handleStrokeMiterAngleBlur(tooBig, 28.96, commit);
    handleStrokeMiterAngleBlur(tooSmall, 28.96, commit);

    // result
    expect(commit).toHaveBeenNthCalledWith(1, { strokeMiterAngle: 180 });
    expect(commit).toHaveBeenNthCalledWith(2, { strokeMiterAngle: 7.17 });
    expect(tooBig.target.value).toBe('180°');
    expect(tooSmall.target.value).toBe('7.17°');
  });

  it('should not commit an unchanged angle and should restore the field on invalid text', () => {
    // before
    const commit = vi.fn();
    const invalid = blur('abc');

    // action
    handleStrokeMiterAngleBlur(blur('28.96°'), 28.96, commit);
    handleStrokeMiterAngleBlur(invalid, 28.96, commit);

    // result
    expect(commit).not.toHaveBeenCalled();
    expect(invalid.target.value).toBe('28.96°');
  });
});
