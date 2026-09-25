// utils
import { getEllipseArcChanges } from '../getEllipseArcChanges';
import { makeEllipse } from './fixtures';

describe('getEllipseArcChanges', () => {
  it('should turn the whole arc to a new start, keeping its sweep', () => {
    // result
    expect(getEllipseArcChanges(makeEllipse({ arcEndAngle: 180, arcStartAngle: 120 }), 'start', 45)).toEqual({
      arcEndAngle: 195,
      arcStartAngle: 135,
    });
  });

  it('should turn a full ellipse from the default angles', () => {
    // result
    expect(getEllipseArcChanges(makeEllipse(), 'start', 10)).toEqual({ arcEndAngle: 100, arcStartAngle: 100 });
  });

  it('should set the end angle for a sweep percent, clamped to 100%', () => {
    // result
    expect(getEllipseArcChanges(makeEllipse({ arcStartAngle: 90 }), 'sweep', 50)).toEqual({ arcEndAngle: 270 });
    expect(getEllipseArcChanges(makeEllipse(), 'sweep', 150)).toEqual({ arcEndAngle: 90 });
  });

  it('should set the ratio as a fraction, clamped between 0% and 100%', () => {
    // result
    expect(getEllipseArcChanges(makeEllipse(), 'ratio', 40)).toEqual({ arcRatio: 0.4 });
    expect(getEllipseArcChanges(makeEllipse(), 'ratio', -5)).toEqual({ arcRatio: 0 });
  });
});
