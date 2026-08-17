// types
import { TCornerRadiusHandle, TPoint } from 'types/canvas';

const CORNER_QUADRANT_DIRECTIONS: Record<TCornerRadiusHandle, TPoint> = {
  ne: { x: 1, y: -1 },
  nw: { x: -1, y: -1 },
  se: { x: 1, y: 1 },
  sw: { x: -1, y: 1 },
};

const getAlignmentScore = (corner: TCornerRadiusHandle, delta: TPoint): number => {
  const direction = CORNER_QUADRANT_DIRECTIONS[corner];

  return direction.x * delta.x + direction.y * delta.y;
};

export const resolveCornerFromDirection = (candidates: TCornerRadiusHandle[], delta: TPoint): TCornerRadiusHandle | null => {
  if (delta.x === 0 && delta.y === 0) {
    return null;
  }

  const scores = candidates.map((candidate) => ({ candidate, score: getAlignmentScore(candidate, delta) }));
  const maxScore = Math.max(...scores.map(({ score }) => score));
  const winners = scores.filter(({ score }) => score === maxScore);

  return winners.length === 1 ? winners[0].candidate : null;
};
