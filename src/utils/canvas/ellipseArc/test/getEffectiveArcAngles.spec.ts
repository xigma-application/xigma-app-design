// utils
import { getEffectiveArcAngles } from '../getEffectiveArcAngles';

describe('getEffectiveArcAngles', () => {
  it('should pass the raw angles through unchanged when not inverted', () => {
    // result
    expect(getEffectiveArcAngles(0, 90, false)).toEqual({ effectiveEndAngle: 90, effectiveStartAngle: 0 });
  });

  it('should resolve to the complementary (major, majorStart + majorSweep) pair when inverted', () => {
    // result — majorArc(0, 90) is {majorStart: 90, majorSweep: 270}, so the complement pair is (90, 360)
    expect(getEffectiveArcAngles(0, 90, true)).toEqual({ effectiveEndAngle: 360, effectiveStartAngle: 90 });
  });

  it('should resolve the complementary pair for a negative-direction cut too', () => {
    // result — majorArc(90, 0) is {majorStart: 0, majorSweep: -270}, complement pair is (0, -270)
    expect(getEffectiveArcAngles(90, 0, true)).toEqual({ effectiveEndAngle: -270, effectiveStartAngle: 0 });
  });
});
