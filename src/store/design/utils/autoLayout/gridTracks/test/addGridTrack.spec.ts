// types
import { SizingMode } from 'types/design/enums';

// utils
import { addGridTrack } from '../addGridTrack';
import { DEFAULT_GRID_TRACK } from '../buildGridTrackList';

describe('addGridTrack', () => {
  it('should append a fresh default fill track without mutating the input', () => {
    // before
    const tracks = [{ mode: SizingMode.fixed, value: 40 }];
    const next = addGridTrack(tracks);

    // result
    expect(next).toEqual([{ mode: SizingMode.fixed, value: 40 }, DEFAULT_GRID_TRACK]);
    expect(tracks).toHaveLength(1);
    expect(next[1]).not.toBe(DEFAULT_GRID_TRACK);
  });
});
