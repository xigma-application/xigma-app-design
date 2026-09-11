// constant
import {
  GRID_TRACK_AFFORDANCE_EXPANDED_HOVER_MARGIN_PX,
  GRID_TRACK_AFFORDANCE_LENGTH_PX,
  GRID_TRACK_AFFORDANCE_THICKNESS_PX,
} from 'constant/canvas';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TPoint } from 'types/canvas';

export const isPointInGridTrackAffordanceHoverZone = (point: TPoint, center: TPoint, axis: TGridTrackAxis, zoom: number): boolean => {
  const halfLength = (GRID_TRACK_AFFORDANCE_LENGTH_PX / 2 + GRID_TRACK_AFFORDANCE_EXPANDED_HOVER_MARGIN_PX) / zoom;
  const halfThickness = (GRID_TRACK_AFFORDANCE_THICKNESS_PX / 2 + GRID_TRACK_AFFORDANCE_EXPANDED_HOVER_MARGIN_PX) / zoom;
  const halfWidth = axis === 'column' ? halfLength : halfThickness;
  const halfHeight = axis === 'column' ? halfThickness : halfLength;

  return Math.abs(point.x - center.x) <= halfWidth && Math.abs(point.y - center.y) <= halfHeight;
};
