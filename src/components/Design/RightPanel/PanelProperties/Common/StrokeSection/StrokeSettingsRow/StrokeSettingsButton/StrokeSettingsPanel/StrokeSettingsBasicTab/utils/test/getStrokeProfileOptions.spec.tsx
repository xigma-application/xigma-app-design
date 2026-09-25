// types
import { StrokeProfile } from 'types/design/enums';

// utils
import { getStrokeProfileOptions } from '../getStrokeProfileOptions';
import { STROKE_PROFILE_ORDER } from 'constant/strokeProfile';

describe('getStrokeProfileOptions', () => {
  it('should build a labelled option with a preview for every profile', () => {
    // before
    const options = getStrokeProfileOptions((profile) => `label-${profile}`);

    // result
    expect(options.map((option) => option.value)).toEqual(STROKE_PROFILE_ORDER);
    expect(options[0].label).toBe(`label-${STROKE_PROFILE_ORDER[0]}`);
    expect(options.find((option) => option.value === StrokeProfile.uniform)?.content).toBeTruthy();
  });
});
