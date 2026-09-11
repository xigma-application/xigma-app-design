// types
import { SizingMode } from 'types/design/enums';

// utils
import { getGridTrackAffordanceValueText } from '../getGridTrackAffordanceValueText';

describe('getGridTrackAffordanceValueText', () => {
  it('should format a fixed track as its raw px value', () => {
    expect(getGridTrackAffordanceValueText({ mode: SizingMode.fixed, value: 120 }, 120)).toBe('120');
  });

  it('should default a fixed track with no value to 0', () => {
    expect(getGridTrackAffordanceValueText({ mode: SizingMode.fixed }, 0)).toBe('0');
  });

  it('should format a fill track as its fr weight', () => {
    expect(getGridTrackAffordanceValueText({ mode: SizingMode.fill, value: 2 }, 150)).toBe('2fr');
  });

  it('should default a fill track with no value to 1fr', () => {
    expect(getGridTrackAffordanceValueText({ mode: SizingMode.fill }, 150)).toBe('1fr');
  });

  it('should format a hug track as its rounded resolved size', () => {
    expect(getGridTrackAffordanceValueText({ mode: SizingMode.hug }, 276.567)).toBe('276.57');
  });
});
