// types
import { TPoint } from 'types/canvas';

export const getNearestSlotOwnerId = (slots: Record<string, TPoint>, target: TPoint): string => {
  const ids = Object.keys(slots);

  return ids.reduce((nearestId, id) => {
    const best = slots[nearestId];
    const candidate = slots[id];
    const bestDistance = (best.x - target.x) ** 2 + (best.y - target.y) ** 2;
    const candidateDistance = (candidate.x - target.x) ** 2 + (candidate.y - target.y) ** 2;

    return candidateDistance < bestDistance ? id : nearestId;
  }, ids[0]);
};
