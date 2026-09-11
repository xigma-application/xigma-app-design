// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGridTrackAffordanceExpandedGeometry } from './getGridTrackAffordanceExpandedGeometry';
import { TGridTrackAffordanceHandlePart } from 'types/design/canvas/types';

export const getGridTrackAffordanceHandleBands = (
  center: TPoint,
  geometry: TGridTrackAffordanceExpandedGeometry,
): Record<TGridTrackAffordanceHandlePart, TDraftRect> => {
  const left = center.x - geometry.badgeWidth / 2;
  const right = center.x + geometry.badgeWidth / 2;
  const top = center.y - geometry.badgeHeight / 2;
  const height = geometry.badgeHeight;
  const gripValueMid = (geometry.gripCenter.x + geometry.textCenter.x) / 2;
  const valueChevronMid = (geometry.textCenter.x + geometry.chevronCenter.x) / 2;

  return {
    chevron: { height, width: right - valueChevronMid, x: valueChevronMid, y: top },
    grip: { height, width: gripValueMid - left, x: left, y: top },
    value: { height, width: valueChevronMid - gripValueMid, x: gripValueMid, y: top },
  };
};
