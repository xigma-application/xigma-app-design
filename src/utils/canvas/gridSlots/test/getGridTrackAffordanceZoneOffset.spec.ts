// utils
import { getGridTrackAffordanceZoneOffset } from '../getGridTrackAffordanceZoneOffset';

describe('getGridTrackAffordanceZoneOffset', () => {
  it('should return the measured 80px at 100% zoom', () => {
    expect(getGridTrackAffordanceZoneOffset(1)).toBeCloseTo(80);
  });

  it('should scale sub-linearly (sqrt) between the min and max screen offset', () => {
    // sqrt(0.25) * 80 = 40, still inside [24, 160] -> world offset = 40 / 0.25
    expect(getGridTrackAffordanceZoneOffset(0.25)).toBeCloseTo(160);
  });

  it('should clamp the screen-space offset to a floor when zoomed far out', () => {
    const zoom = 0.0001;
    const worldOffset = getGridTrackAffordanceZoneOffset(zoom);

    expect(worldOffset * zoom).toBeCloseTo(24);
  });

  it('should clamp the screen-space offset to a ceiling when zoomed far in', () => {
    const zoom = 100;
    const worldOffset = getGridTrackAffordanceZoneOffset(zoom);

    expect(worldOffset * zoom).toBeCloseTo(160);
  });
});
