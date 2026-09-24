import { CONTACT_GUIDE_TOLERANCE_PX } from 'constant/canvas';

import { TDraftRect } from 'types/canvas';

const isNear = (a: number, b: number): boolean => Math.abs(a - b) <= CONTACT_GUIDE_TOLERANCE_PX;

export const hasNearbyContactEdge = (active: TDraftRect, candidate: TDraftRect): boolean => {
  const aRight = active.x + active.width;
  const aBottom = active.y + active.height;
  const bRight = candidate.x + candidate.width;
  const bBottom = candidate.y + candidate.height;

  return (
    isNear(aRight, candidate.x) ||
    isNear(active.x, bRight) ||
    isNear(aBottom, candidate.y) ||
    isNear(active.y, bBottom) ||
    isNear(active.y, candidate.y) ||
    isNear(aBottom, bBottom) ||
    isNear(active.x, candidate.x) ||
    isNear(aRight, bRight)
  );
};
