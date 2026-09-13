// types
import { TEditableGradientStop } from '../../../../types';

const STOP_HIT_RADIUS_PX = 10;

export const findStopNearClientX = (
  stops: TEditableGradientStop[],
  clientX: number,
  bar: HTMLDivElement,
): TEditableGradientStop | undefined => {
  const rect = bar.getBoundingClientRect();

  return stops.find((stop) => Math.abs(clientX - (rect.left + stop.position * rect.width)) <= STOP_HIT_RADIUS_PX);
};
