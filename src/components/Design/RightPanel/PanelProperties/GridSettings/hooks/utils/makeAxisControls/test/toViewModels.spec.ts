// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackSize } from 'types/design/types';

// utils
import { toViewModels } from '../toViewModels';

describe('toViewModels', () => {
  it('should default the view-model value to 1 for fill and 0 for non-fill without a value', () => {
    const tracks: TGridTrackSize[] = [{ mode: SizingMode.fill }, { mode: SizingMode.fixed, value: 80 }, { mode: SizingMode.hug }];

    expect(toViewModels(tracks, [[0], [1], [2]], [120, 80, 60])).toEqual([
      { index: 0, linkedIndices: [0], mode: SizingMode.fill, resolvedSize: 120, value: 1 },
      { index: 1, linkedIndices: [1], mode: SizingMode.fixed, resolvedSize: 80, value: 80 },
      { index: 2, linkedIndices: [2], mode: SizingMode.hug, resolvedSize: 60, value: 0 },
    ]);
  });

  it('should carry each track its own resolved size from the engine', () => {
    const tracks: TGridTrackSize[] = [{ mode: SizingMode.hug }, { mode: SizingMode.hug }];

    expect(toViewModels(tracks, [[0], [1]], [42.5, 128]).map((track) => track.resolvedSize)).toEqual([42.5, 128]);
  });

  it('should fall back to 0 as the resolved size when the engine gave no size for that track', () => {
    const tracks: TGridTrackSize[] = [{ mode: SizingMode.fixed }];

    expect(toViewModels(tracks, [[0]], []).map((track) => track.resolvedSize)).toEqual([0]);
  });

  it('should attach the given linked group to each track', () => {
    const tracks: TGridTrackSize[] = [
      { mode: SizingMode.fixed, value: 10 },
      { mode: SizingMode.fixed, value: 10 },
    ];

    expect(
      toViewModels(
        tracks,
        [
          [0, 1],
          [0, 1],
        ],
        [50, 50],
      ).map((track) => track.linkedIndices),
    ).toEqual([
      [0, 1],
      [0, 1],
    ]);
  });
});
