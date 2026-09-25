// others
import { VECTOR_PROFILE_SAMPLES } from './constants';

// types
import { StrokeProfile } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { getLoopArcLengthPositions } from 'utils/canvas/getLoopArcLengthPositions';
import { getQuarterTaperWidthMultiplier } from 'utils/design/stroke/getQuarterTaperWidthMultiplier';
import { getStrokeOutlinePolygons } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';
import { getStrokeProfileWidthMultiplier } from 'utils/design/stroke/getStrokeProfileWidthMultiplier';
import { resampleClosedLoop } from './resampleClosedLoop';

const getMultiplier = (profile: StrokeProfile, position: number, flipped: boolean): number =>
  profile === StrokeProfile.quarterTaper
    ? getQuarterTaperWidthMultiplier(position, flipped)
    : getStrokeProfileWidthMultiplier(profile, position, flipped);

const scaleAround = (mid: TPoint, point: TPoint, multiplier: number): TPoint => ({
  x: mid.x + (point.x - mid.x) * multiplier,
  y: mid.y + (point.y - mid.y) * multiplier,
});

export const getVectorProfileRingPolygons = (points: TPoint[], halfWidth: number, profile: StrokeProfile, flipped: boolean): TPoint[][] => {
  const loop = resampleClosedLoop(points, VECTOR_PROFILE_SAMPLES);
  const { inner, outer } = getStrokeOutlinePolygons(loop, halfWidth, true);
  const positions = getLoopArcLengthPositions(loop);
  const multipliers = positions.map((position) => getMultiplier(profile, position, flipped));

  return [
    outer.map((point, index) => scaleAround(loop[index], point, multipliers[index])),
    inner.map((point, index) => scaleAround(loop[index], point, multipliers[index])),
  ];
};
