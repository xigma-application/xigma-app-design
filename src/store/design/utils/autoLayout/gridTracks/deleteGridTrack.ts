// types
import { TGridTrackSize } from 'types/design/types';

export const deleteGridTrack = (tracks: TGridTrackSize[], index: number): TGridTrackSize[] =>
  tracks.filter((_track, trackIndex) => trackIndex !== index);
