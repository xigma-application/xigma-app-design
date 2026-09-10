// utils
import { getTrackValueFieldText } from '../getTrackValueFieldText';

// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackViewModel } from '../../../../hooks/types';

const track = (overrides: Partial<TGridTrackViewModel> = {}): TGridTrackViewModel => ({
  index: 0,
  linkedIndices: [0],
  mode: SizingMode.fixed,
  resolvedSize: 100,
  value: 1,
  ...overrides,
});

describe('getTrackValueFieldText', () => {
  it('should show the raw value for a fixed track', () => {
    expect(getTrackValueFieldText(track({ mode: SizingMode.fixed, value: 240 }))).toBe('240');
  });

  it('should append the fr unit for a fill track', () => {
    expect(getTrackValueFieldText(track({ mode: SizingMode.fill, value: 2 }))).toBe('2fr');
  });

  it('should show the rounded resolved size for a hug track', () => {
    expect(getTrackValueFieldText(track({ mode: SizingMode.hug, resolvedSize: 276.539, value: 0 }))).toBe('276.54');
  });
});
