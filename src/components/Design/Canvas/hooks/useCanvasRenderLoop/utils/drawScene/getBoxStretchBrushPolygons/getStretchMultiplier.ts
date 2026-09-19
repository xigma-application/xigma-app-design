// types
import { StrokeBrushDirection, StrokeProfile } from 'types/design/enums';

// utils
import { getStrokeProfileWidthMultiplier } from 'utils/design/stroke/getStrokeProfileWidthMultiplier';

export const getStretchMultiplier = (
  distance: number,
  perimeter: number,
  direction: StrokeBrushDirection,
  taperEnd: number,
  profile: StrokeProfile,
  flipped: boolean,
): number => {
  const travel = direction === StrokeBrushDirection.right ? distance : perimeter - distance;
  const position = travel / perimeter;

  return (1 + (taperEnd - 1) * position) * getStrokeProfileWidthMultiplier(profile, position, flipped);
};
