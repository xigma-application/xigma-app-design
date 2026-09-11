// utils
import { getGridTrackAffordanceHoveredPillAxis } from '../getGridTrackAffordanceHoveredPillAxis';

describe('getGridTrackAffordanceHoveredPillAxis', () => {
  it('should return column when the column pill is hit', () => {
    expect(getGridTrackAffordanceHoveredPillAxis(true, false)).toBe('column');
  });

  it('should return row when the row pill is hit', () => {
    expect(getGridTrackAffordanceHoveredPillAxis(false, true)).toBe('row');
  });

  it('should prefer column when both are somehow hit at once', () => {
    expect(getGridTrackAffordanceHoveredPillAxis(true, true)).toBe('column');
  });

  it('should return null when neither pill is hit', () => {
    expect(getGridTrackAffordanceHoveredPillAxis(false, false)).toBeNull();
  });
});
