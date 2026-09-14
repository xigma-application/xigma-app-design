// utils
import { getGradientStopValueLabelText } from '../getGradientStopValueLabelText';

describe('getGradientStopValueLabelText', () => {
  it('should format 0 as 0%', () => {
    expect(getGradientStopValueLabelText(0)).toBe('0%');
  });

  it('should format 1 as 100%', () => {
    expect(getGradientStopValueLabelText(1)).toBe('100%');
  });

  it('should round to the nearest whole percent', () => {
    expect(getGradientStopValueLabelText(0.294)).toBe('29%');
    expect(getGradientStopValueLabelText(0.295)).toBe('30%');
  });
});
