// utils
import { getGlassLightPosition } from '../getGlassLightPosition';

describe('getGlassLightPosition', () => {
  it('should give the offset from the center of the glass, above it for 0 degrees', () => {
    // action
    const top = getGlassLightPosition(0);

    // result — the glass sits 11px below the dial center, so the light is 29px above the glass center
    expect(top.x).toBeCloseTo(0, 5);
    expect(top.y).toBeCloseTo(-29, 5);
  });

  it('should move to the left and up for a negative angle', () => {
    // action
    const upperLeft = getGlassLightPosition(-58);

    // result
    expect(upperLeft.x).toBeLessThan(0);
    expect(upperLeft.y).toBeLessThan(-11);
  });

  it('should move to the right for 90 degrees at the level of the dial center', () => {
    // action
    const right = getGlassLightPosition(90);

    // result
    expect(right.x).toBeCloseTo(19, 5);
    expect(right.y).toBeCloseTo(-11, 5);
  });
});
