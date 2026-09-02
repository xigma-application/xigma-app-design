// utils
import { getEllipseArcRatioValueLabelText } from '../getEllipseArcRatioValueLabelText';

describe('getEllipseArcRatioValueLabelText', () => {
  it('should show "Ratio 0.0%" for no hole at all (ratio at the center)', () => {
    // result
    expect(getEllipseArcRatioValueLabelText(0)).toBe('Ratio 0.0%');
  });

  it('should show "Ratio 100.0%" at the outer edge, regardless of which direction the hole was dragged out from', () => {
    // result
    expect(getEllipseArcRatioValueLabelText(1)).toBe('Ratio 100.0%');
  });

  it('should show a one-decimal percentage in between', () => {
    // result
    expect(getEllipseArcRatioValueLabelText(0.285)).toBe('Ratio 28.5%');
  });
});
