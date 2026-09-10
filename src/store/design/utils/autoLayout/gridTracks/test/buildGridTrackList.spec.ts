// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackSize } from 'types/design/types';

// utils
import { buildGridTrackList, DEFAULT_GRID_TRACK } from '../buildGridTrackList';

const fixed = (value: number): TGridTrackSize => ({ mode: SizingMode.fixed, value });

describe('buildGridTrackList', () => {
  it('should fill every slot with a fresh default track when nothing is provided', () => {
    // before
    const tracks = buildGridTrackList(3, undefined);

    // result
    expect(tracks).toEqual([DEFAULT_GRID_TRACK, DEFAULT_GRID_TRACK, DEFAULT_GRID_TRACK]);
    expect(tracks[0]).not.toBe(tracks[1]);
  });

  it('should keep provided tracks and pad the rest with the default', () => {
    // before
    const tracks = buildGridTrackList(3, [fixed(40)]);

    // result
    expect(tracks).toEqual([fixed(40), DEFAULT_GRID_TRACK, DEFAULT_GRID_TRACK]);
  });

  it('should drop provided tracks past the requested count', () => {
    // before
    const tracks = buildGridTrackList(1, [fixed(40), fixed(80)]);

    // result
    expect(tracks).toEqual([fixed(40)]);
  });

  it('should clamp the count to at least one', () => {
    // before
    const tracks = buildGridTrackList(0, undefined);

    // result
    expect(tracks).toEqual([DEFAULT_GRID_TRACK]);
  });
});
