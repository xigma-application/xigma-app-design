// utils
import { roundTrackSize } from '../roundTrackSize';

describe('roundTrackSize', () => {
  it('should round to two decimal places', () => {
    expect(roundTrackSize(646.333333)).toBe(646.33);
  });

  it('should leave a whole number untouched', () => {
    expect(roundTrackSize(100)).toBe(100);
  });
});
