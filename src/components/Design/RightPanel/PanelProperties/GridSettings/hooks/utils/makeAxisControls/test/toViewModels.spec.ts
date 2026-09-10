// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackSize } from 'types/design/types';

// utils
import { toViewModels } from '../toViewModels';

describe('toViewModels', () => {
  it('should default the view-model value to 1 for fill and 0 for non-fill without a value', () => {
    const tracks: TGridTrackSize[] = [{ mode: SizingMode.fill }, { mode: SizingMode.fixed, value: 80 }, { mode: SizingMode.hug }];

    expect(toViewModels(tracks, [[0], [1], [2]], 120)).toEqual([
      { index: 0, linkedIndices: [0], mode: SizingMode.fill, resolvedSize: 120, value: 1 },
      { index: 1, linkedIndices: [1], mode: SizingMode.fixed, resolvedSize: 80, value: 80 },
      { index: 2, linkedIndices: [2], mode: SizingMode.hug, resolvedSize: 120, value: 0 },
    ]);
  });

  it('should fall back to the axis size as the resolved size for a fixed track with no value', () => {
    const tracks: TGridTrackSize[] = [{ mode: SizingMode.fixed }];

    expect(toViewModels(tracks, [[0]], 64)).toEqual([{ index: 0, linkedIndices: [0], mode: SizingMode.fixed, resolvedSize: 64, value: 0 }]);
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
        50,
      ).map((track) => track.linkedIndices),
    ).toEqual([
      [0, 1],
      [0, 1],
    ]);
  });
});
