// types
import { TDrawSceneContext } from '../types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TGridTrackSize } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { drawGridTrackAffordanceExpanded } from './drawGridTrackAffordanceExpanded/drawGridTrackAffordanceExpanded';
import { drawGridTrackAffordancePill } from './drawGridTrackAffordancePill';
import { getGridTrackAffordanceValueText } from 'utils/canvas/gridSlots/getGridTrackAffordanceValueText';

export const drawGridTrackAffordanceAxis = (
  context: TDrawSceneContext,
  center: TPoint,
  axis: TGridTrackAxis,
  isExpanded: boolean,
  track: TGridTrackSize,
  resolvedSize: number,
  rotation: number,
  rotationCenter: TPoint,
): void => {
  if (isExpanded) {
    drawGridTrackAffordanceExpanded(context, center, axis, getGridTrackAffordanceValueText(track, resolvedSize), rotation, rotationCenter);
  } else {
    drawGridTrackAffordancePill(context, center, axis, rotation, rotationCenter);
  }
};
