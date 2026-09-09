// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackSize } from 'types/design/types';

// utils
import { buildGridTracks } from '../buildGridTracks';

const fallback: TGridTrackSize = { mode: SizingMode.fill, value: 1 };
const fixed = (value: number): TGridTrackSize => ({ mode: SizingMode.fixed, value });

describe('buildGridTracks behaviors', () => {
  it('should fill every slot with the fallback when nothing is provided', () => {
    // before
    const tracks = buildGridTracks(3, undefined, fallback);

    // result
    expect(tracks).toEqual([fallback, fallback, fallback]);
  });

  it('should keep each provided track and pad the remaining slots with the fallback', () => {
    // before
    const tracks = buildGridTracks(3, [fixed(40)], fallback);

    // result
    expect(tracks).toEqual([fixed(40), fallback, fallback]);
  });

  it('should drop provided tracks beyond the requested count', () => {
    // before
    const tracks = buildGridTracks(1, [fixed(40), fixed(80)], fallback);

    // result
    expect(tracks).toEqual([fixed(40)]);
  });

  it('should return an empty array for a zero count', () => {
    // before
    const tracks = buildGridTracks(0, undefined, fallback);

    // result
    expect(tracks).toEqual([]);
  });
});
