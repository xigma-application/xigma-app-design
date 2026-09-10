// utils
import { getGridTrackAffordancePillOffset } from '../getGridTrackAffordancePillOffset';

describe('getGridTrackAffordancePillOffset', () => {
  it('should return half of the measured 80px at 100% zoom', () => {
    expect(getGridTrackAffordancePillOffset(1)).toBeCloseTo(40);
  });

  it('should scale sub-linearly (sqrt) between the min and max screen offset', () => {
    // sqrt(0.25) * 40 = 20, still inside [12, 80] -> world offset = 20 / 0.25
    expect(getGridTrackAffordancePillOffset(0.25)).toBeCloseTo(80);
  });

  it('should clamp the screen-space offset to a floor when zoomed far out', () => {
    const zoom = 0.0001;
    const worldOffset = getGridTrackAffordancePillOffset(zoom);

    expect(worldOffset * zoom).toBeCloseTo(12);
  });

  it('should clamp the screen-space offset to a ceiling when zoomed far in', () => {
    const zoom = 100;
    const worldOffset = getGridTrackAffordancePillOffset(zoom);

    expect(worldOffset * zoom).toBeCloseTo(80);
  });
});
