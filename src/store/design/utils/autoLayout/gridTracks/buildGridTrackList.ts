// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackSize } from 'types/design/types';

export const DEFAULT_GRID_TRACK: TGridTrackSize = { mode: SizingMode.fill, value: 1 };

export const buildGridTrackList = (count: number, provided: TGridTrackSize[] | undefined): TGridTrackSize[] =>
  Array.from({ length: Math.max(Math.round(count), 1) }, (_unused, index) => provided?.[index] ?? { ...DEFAULT_GRID_TRACK });
