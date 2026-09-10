// constant
import {
  GRID_TRACK_AFFORDANCE_PILL_OFFSET_MAX_PX,
  GRID_TRACK_AFFORDANCE_PILL_OFFSET_MIN_PX,
  GRID_TRACK_AFFORDANCE_PILL_OFFSET_PX,
} from 'constant/canvas';

// utils
import { clamp } from 'utils/math/clamp';

export const getGridTrackAffordancePillOffset = (zoom: number): number => {
  const screenOffset = clamp(
    GRID_TRACK_AFFORDANCE_PILL_OFFSET_PX * Math.sqrt(zoom),
    GRID_TRACK_AFFORDANCE_PILL_OFFSET_MIN_PX,
    GRID_TRACK_AFFORDANCE_PILL_OFFSET_MAX_PX,
  );

  return screenOffset / zoom;
};
