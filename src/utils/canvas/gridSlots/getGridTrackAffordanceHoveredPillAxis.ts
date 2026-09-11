// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export const getGridTrackAffordanceHoveredPillAxis = (isOverColumnPill: boolean, isOverRowPill: boolean): TGridTrackAxis | null => {
  switch (true) {
    case isOverColumnPill:
      return 'column';
    case isOverRowPill:
      return 'row';
    default:
      return null;
  }
};
