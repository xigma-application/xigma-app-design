// utils
import { roundTrackSize } from 'store/design/utils/autoLayout/gridTracks/roundTrackSize';

// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackViewModel } from '../../../hooks/types';

export const getTrackValueFieldText = (track: TGridTrackViewModel): string => {
  if (track.mode === SizingMode.hug) {
    return String(roundTrackSize(track.resolvedSize));
  }

  if (track.mode === SizingMode.fill) {
    return `${track.value}fr`;
  }

  return String(track.value);
};
