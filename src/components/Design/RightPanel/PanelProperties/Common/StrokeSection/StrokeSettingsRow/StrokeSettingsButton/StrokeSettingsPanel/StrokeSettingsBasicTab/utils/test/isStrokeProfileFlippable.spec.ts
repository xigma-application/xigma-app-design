// types
import { StrokeProfile } from 'types/design/enums';

// utils
import { isStrokeProfileFlippable } from '../isStrokeProfileFlippable';

describe('isStrokeProfileFlippable', () => {
  it.each([StrokeProfile.wedge, StrokeProfile.taper])('should allow flipping the %s profile', (profile) => {
    expect(isStrokeProfileFlippable(profile)).toBe(true);
  });

  it.each([StrokeProfile.uniform, StrokeProfile.quarterTaper, StrokeProfile.eye, StrokeProfile.mirroredTaper])(
    'should not allow flipping the %s profile',
    (profile) => {
      expect(isStrokeProfileFlippable(profile)).toBe(false);
    },
  );
});
