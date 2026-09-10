// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackSize } from 'types/design/types';
import { TGridTrackViewModel } from '../../types';

export const toViewModels = (tracks: TGridTrackSize[], linkedGroups: number[][], axisSize: number): TGridTrackViewModel[] =>
  tracks.map((track, index) => ({
    index,
    linkedIndices: linkedGroups[index],
    mode: track.mode,
    resolvedSize: track.mode === SizingMode.fixed ? (track.value ?? axisSize) : axisSize,
    value: track.value ?? (track.mode === SizingMode.fill ? 1 : 0),
  }));
