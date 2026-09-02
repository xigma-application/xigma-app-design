// types
import { TEdges } from '../../getDistanceGuides/types';
import { TEqualSpacingCandidate, TMatchedPairGuides } from '../types';

// utils
import { getEdges } from '../../getDistanceGuides/getEdges';

const NO_MATCH: TMatchedPairGuides = { lines: [], markers: [] };

export const getHorizontalMatchedPair = (
  active: TEdges,
  candidates: TEqualSpacingCandidate[],
  sizeToleranceWorldUnits: number,
  centreToleranceWorldUnits: number,
): TMatchedPairGuides => {
  const activeWidth = active.right - active.left;
  const activeHeight = active.bottom - active.top;
  const activeCentreX = (active.left + active.right) / 2;
  const activeCentreY = (active.top + active.bottom) / 2;

  const match = candidates.find((candidate) => {
    const edges = getEdges(candidate.bounds);
    const sameSize =
      Math.abs(edges.right - edges.left - activeWidth) <= sizeToleranceWorldUnits &&
      Math.abs(edges.bottom - edges.top - activeHeight) <= sizeToleranceWorldUnits;
    const stacked = edges.right < active.left || edges.left > active.right;
    const centred = Math.abs((edges.top + edges.bottom) / 2 - activeCentreY) <= centreToleranceWorldUnits;

    return sameSize && stacked && centred;
  });

  if (match) {
    const edges = getEdges(match.bounds);
    const farX = edges.right <= active.left ? edges.left : edges.right;
    const spanLeft = Math.min(active.left, edges.left);
    const spanRight = Math.max(active.right, edges.right);

    return {
      lines: [
        { dashed: false, x1: activeCentreX, x2: farX, y1: activeCentreY, y2: activeCentreY },
        { dashed: false, x1: spanLeft, x2: spanRight, y1: active.top, y2: active.top },
        { dashed: false, x1: spanLeft, x2: spanRight, y1: active.bottom, y2: active.bottom },
      ],
      markers: [
        { x: activeCentreX, y: activeCentreY },
        { x: farX, y: activeCentreY },
        { x: active.left, y: active.top },
        { x: active.right, y: active.top },
        { x: active.left, y: active.bottom },
        { x: active.right, y: active.bottom },
        { x: edges.left, y: edges.top },
        { x: edges.right, y: edges.top },
        { x: edges.left, y: edges.bottom },
        { x: edges.right, y: edges.bottom },
      ],
    };
  }

  return NO_MATCH;
};
