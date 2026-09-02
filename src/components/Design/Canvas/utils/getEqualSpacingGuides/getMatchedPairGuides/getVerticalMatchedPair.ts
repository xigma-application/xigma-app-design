// types
import { TEdges } from '../../getDistanceGuides/types';
import { TEqualSpacingCandidate, TMatchedPairGuides } from '../types';

// utils
import { getEdges } from '../../getDistanceGuides/getEdges';

const NO_MATCH: TMatchedPairGuides = { lines: [], markers: [] };

export const getVerticalMatchedPair = (
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
    const stacked = edges.bottom < active.top || edges.top > active.bottom;
    const centred = Math.abs((edges.left + edges.right) / 2 - activeCentreX) <= centreToleranceWorldUnits;

    return sameSize && stacked && centred;
  });

  if (match) {
    const edges = getEdges(match.bounds);
    const farY = edges.bottom <= active.top ? edges.top : edges.bottom;
    const spanTop = Math.min(active.top, edges.top);
    const spanBottom = Math.max(active.bottom, edges.bottom);

    return {
      lines: [
        { dashed: false, x1: activeCentreX, x2: activeCentreX, y1: activeCentreY, y2: farY },
        { dashed: false, x1: active.left, x2: active.left, y1: spanTop, y2: spanBottom },
        { dashed: false, x1: active.right, x2: active.right, y1: spanTop, y2: spanBottom },
      ],
      markers: [
        { x: activeCentreX, y: activeCentreY },
        { x: activeCentreX, y: farY },
        { x: active.left, y: active.top },
        { x: active.left, y: active.bottom },
        { x: active.right, y: active.top },
        { x: active.right, y: active.bottom },
        { x: edges.left, y: edges.top },
        { x: edges.left, y: edges.bottom },
        { x: edges.right, y: edges.top },
        { x: edges.right, y: edges.bottom },
      ],
    };
  }

  return NO_MATCH;
};
