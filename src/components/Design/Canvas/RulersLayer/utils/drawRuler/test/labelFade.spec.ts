// utils
import { labelFade } from '../labelFade';

const STEP_PX = 100;

describe('labelFade', () => {
  it('should return full opacity well away from the reference point', () => {
    // result — 1.5 * step = 150px is the fade-in start
    expect(labelFade(150, STEP_PX)).toBe(1);
    expect(labelFade(400, STEP_PX)).toBe(1);
  });

  it('should drop the label entirely once it is inside the fade-out zone', () => {
    // result — 0.375 * step = 37.5px
    expect(labelFade(37.5, STEP_PX)).toBeNull();
    expect(labelFade(10, STEP_PX)).toBeNull();
    expect(labelFade(0, STEP_PX)).toBeNull();
  });

  it('should ramp linearly between the fade-out and fade-in distances', () => {
    // result
    expect(labelFade(75, STEP_PX)).toBeCloseTo((75 - 37.5) / (150 - 37.5));
    expect(labelFade(100, STEP_PX)).toBeCloseTo((100 - 37.5) / (150 - 37.5));
    expect(labelFade(75, STEP_PX)!).toBeLessThan(labelFade(100, STEP_PX)!);
  });

  it('should scale its zones with the step size', () => {
    // result — at a 40px step, fade-out ends at 15px
    expect(labelFade(14, 40)).toBeNull();
    expect(labelFade(60, 40)).toBe(1);
  });
});
