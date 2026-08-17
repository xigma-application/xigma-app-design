// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getMaxStarCornerRadius } from 'utils/canvas/cornerRadius/star/getMaxStarCornerRadius';
import { getRoundedVertexPoints } from './getRoundedVertexPoints';
import { getStarPoints } from './getStarPoints';

export type TRoundedStar = TDraftRect & { cornerRadius: number; points: number; ratio: number };

export const getRoundedStarPoints = (star: TRoundedStar, segmentsPerVertex: number): TPoint[] => {
  const vertices = getStarPoints(star, star.points, star.ratio);
  const radius = Math.min(Math.max(star.cornerRadius, 0), getMaxStarCornerRadius(star, star.points, star.ratio));

  return getRoundedVertexPoints(vertices, radius, segmentsPerVertex);
};
