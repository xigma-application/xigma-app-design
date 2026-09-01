// utils
import { getEllipseArcStartAngleDegrees } from '../getEllipseArcStartAngleDegrees';

describe('getEllipseArcStartAngleDegrees', () => {
  it('should read 0° at the rest state (arcStartAngle at its default)', () => {
    // result
    expect(getEllipseArcStartAngleDegrees(90)).toBe(0);
  });

  it('should count down as the handle rotates counter-clockwise, all the way to exactly -180°', () => {
    // result
    expect(getEllipseArcStartAngleDegrees(45)).toBe(-45);
    expect(getEllipseArcStartAngleDegrees(-90)).toBe(-180);
  });

  it('should wrap just past -180° back up to just under +180°, then keep counting down from there', () => {
    // result — one degree further counter-clockwise than the -180° case above
    expect(getEllipseArcStartAngleDegrees(-91)).toBe(179);
    expect(getEllipseArcStartAngleDegrees(-180)).toBe(90);
  });

  it('should return to exactly 0° after one full counter-clockwise lap', () => {
    // result
    expect(getEllipseArcStartAngleDegrees(-270)).toBe(0);
  });

  it('should count up as the handle rotates clockwise, wrapping to -180° once it reaches a full half-turn', () => {
    // result
    expect(getEllipseArcStartAngleDegrees(135)).toBe(45);
    expect(getEllipseArcStartAngleDegrees(270)).toBe(-180);
  });

  it('should return to exactly 0° after one full clockwise lap', () => {
    // result
    expect(getEllipseArcStartAngleDegrees(450)).toBe(0);
  });
});
