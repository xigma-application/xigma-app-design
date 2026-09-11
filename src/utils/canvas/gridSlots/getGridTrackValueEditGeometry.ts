// types
import { TFrameNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getAutoLayoutFrameCenter } from 'store/design/utils/autoLayout/getAutoLayoutFrameCenter';
import { getGridTrackAffordanceExpandedGeometry } from './getGridTrackAffordanceExpandedGeometry';
import { getGridTrackAffordanceHandleBands } from './getGridTrackAffordanceHandleBands';
import { getGridTrackValueEditBounds } from './getGridTrackValueEditBounds';
import { rotatePoint } from 'utils/math/rotatePoint';

export type TGridTrackValueEditGeometry = {
  badgeHeight: number;
  badgeWidth: number;
  center: TPoint;
};

export const getGridTrackValueEditGeometry = (
  pillCenter: TPoint,
  text: string,
  zoom: number,
  frame: TFrameNode,
): TGridTrackValueEditGeometry | null => {
  const bounds = getGridTrackValueEditBounds(text, zoom);

  if (bounds) {
    const geometry = getGridTrackAffordanceExpandedGeometry(pillCenter, bounds, zoom);
    const valueBand = getGridTrackAffordanceHandleBands(pillCenter, geometry).value;
    const frameCenter = getAutoLayoutFrameCenter(frame);
    const center = rotatePoint(geometry.textCenter, frameCenter, frame.rotation);

    return { badgeHeight: geometry.badgeHeight, badgeWidth: valueBand.width, center };
  }

  return null;
};
