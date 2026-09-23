// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export type TGridMoveStep = {
  axis: TGridTrackAxis;
  step: 1 | -1;
};

export const getGridMoveStep = (deltaX: number, deltaY: number): TGridMoveStep | null => {
  switch (true) {
    case deltaX !== 0:
      return { axis: 'column', step: deltaX > 0 ? 1 : -1 };
    case deltaY !== 0:
      return { axis: 'row', step: deltaY > 0 ? 1 : -1 };
    default:
      return null;
  }
};
