// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackSize } from 'types/design/types';

export const getGridTrackAffordanceValueText = (track: TGridTrackSize, resolvedSize: number): string => {
  switch (track.mode) {
    case SizingMode.hug:
      return String(Math.round(resolvedSize * 100) / 100);
    case SizingMode.fill:
      return `${track.value ?? 1}fr`;
    default:
      return String(track.value ?? 0);
  }
};
