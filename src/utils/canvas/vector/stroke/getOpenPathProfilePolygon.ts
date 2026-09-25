// others
import { OPEN_PATH_PROFILE_SAMPLES } from './constants';

// types
import { StrokeProfile } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TStrokeRing } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/types';

// utils
import { getStrokeProfileWidthMultiplier } from 'utils/design/stroke/getStrokeProfileWidthMultiplier';
import { getStrokeRingDistances } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getStrokeRingDistances';
import { getStrokeRingPoint } from './getStrokeRingPoint';

export const getOpenPathProfilePolygon = (ring: TStrokeRing, profile: StrokeProfile, flipped: boolean): TPoint[] => {
  const distances = getStrokeRingDistances(ring, ring.perimeter / OPEN_PATH_PROFILE_SAMPLES);
  const multipliers = distances.map((distance) => getStrokeProfileWidthMultiplier(profile, distance / ring.perimeter, flipped));

  return [
    ...distances.map((distance, index) => getStrokeRingPoint(ring, distance, multipliers[index])),
    ...distances.map((distance, index) => getStrokeRingPoint(ring, distance, -multipliers[index])).reverse(),
  ];
};
