// utils
import { getEllipseArcStartValueLabelText } from '../getEllipseArcStartValueLabelText';

describe('getEllipseArcStartValueLabelText', () => {
  it('should show "Start 0°" at the rest state', () => {
    // result
    expect(getEllipseArcStartValueLabelText(90)).toBe('Start 0°');
  });

  it('should show a negative degree reading while rotating counter-clockwise', () => {
    // result
    expect(getEllipseArcStartValueLabelText(-90)).toBe('Start -180°');
  });

  it('should wrap to a positive degree reading just past the -180° boundary', () => {
    // result
    expect(getEllipseArcStartValueLabelText(-91)).toBe('Start 179°');
  });
});
