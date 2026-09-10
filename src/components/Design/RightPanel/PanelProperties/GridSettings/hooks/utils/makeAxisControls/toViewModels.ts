// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackSize } from 'types/design/types';
import { TGridTrackViewModel } from '../../types';

export const toViewModels = (tracks: TGridTrackSize[], linkedGroups: number[][], resolvedSizes: number[]): TGridTrackViewModel[] =>
  tracks.map((track, index) => ({
    index,
    linkedIndices: linkedGroups[index],
    mode: track.mode,
    resolvedSize: resolvedSizes[index] ?? 0,
    value: track.value ?? (track.mode === SizingMode.fill ? 1 : 0),
  }));
