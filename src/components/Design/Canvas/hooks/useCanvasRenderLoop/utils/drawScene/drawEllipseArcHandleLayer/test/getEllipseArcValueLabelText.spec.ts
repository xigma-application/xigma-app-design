// utils
import { getEllipseArcValueLabelText } from '../getEllipseArcValueLabelText';

describe('getEllipseArcValueLabelText', () => {
  it('should show plain "Arc" text at the full-circle rest state', () => {
    // result
    expect(getEllipseArcValueLabelText(90, 90)).toBe('Arc');
  });

  it('should show "Arc" again once dragged back to a full circle after a lap', () => {
    // result
    expect(getEllipseArcValueLabelText(0, 720)).toBe('Arc');
  });

  it('should show a one-decimal "Sweep N%" once the circle is cut away from the rest state', () => {
    // result — a 90° cut out of 360° leaves 75% visible
    expect(getEllipseArcValueLabelText(0, 90)).toBe('Sweep 75.0%');
  });

  it('should show a negative percentage once refilling into the second lap', () => {
    // result
    expect(getEllipseArcValueLabelText(0, 450)).toBe('Sweep -25.0%');
  });
});
