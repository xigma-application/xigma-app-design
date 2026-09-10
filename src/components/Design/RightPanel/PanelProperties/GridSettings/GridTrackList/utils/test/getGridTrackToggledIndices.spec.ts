// utils
import { getGridTrackToggledIndices } from '../getGridTrackToggledIndices';

describe('getGridTrackToggledIndices', () => {
  it('should add a missing index and keep the list sorted', () => {
    expect(getGridTrackToggledIndices([0, 3], 1)).toEqual([0, 1, 3]);
  });

  it('should remove an index that is already selected', () => {
    expect(getGridTrackToggledIndices([0, 1, 3], 1)).toEqual([0, 3]);
  });
});
