// types
import { TGridTrackSize } from 'types/design/types';

export const buildGridTracks = (count: number, provided: TGridTrackSize[] | undefined, fallback: TGridTrackSize): TGridTrackSize[] =>
  Array.from({ length: count }, (_unused, index) => provided?.[index] ?? fallback);
