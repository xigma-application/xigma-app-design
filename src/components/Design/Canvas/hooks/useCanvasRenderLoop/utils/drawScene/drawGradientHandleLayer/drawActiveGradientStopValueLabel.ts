// types
import { TPoint } from 'types/canvas';
import { TGradientStop } from 'types/design/paint/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawGradientStopValueLabel } from './drawGradientStopValueLabel';

export const drawActiveGradientStopValueLabel = (
  context: TDrawSceneContext,
  stops: TGradientStop[],
  stopPositions: TPoint[],
  stopDirections: TPoint[],
  activeStopIndex: number | null,
): void => {
  if (activeStopIndex !== null && stops[activeStopIndex]) {
    drawGradientStopValueLabel(context, stopPositions[activeStopIndex], stopDirections[activeStopIndex], stops[activeStopIndex].position);
  }
};
