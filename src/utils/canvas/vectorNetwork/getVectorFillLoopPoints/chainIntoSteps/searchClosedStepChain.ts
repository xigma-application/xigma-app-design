// types
import { TSearchContext } from './types';
import { TVectorFaceStep } from '../../walkVectorFace';

// utils
import { getNextUnitHalfEdgeCandidates } from './getNextUnitHalfEdge';

export const searchClosedStepChain = (
  fromId: string,
  toId: string,
  segmentId: string,
  visited: Set<string>,
  steps: TVectorFaceStep[],
  context: TSearchContext,
): TVectorFaceStep[] | null => {
  context.budget.remaining -= 1;

  if (context.budget.remaining > 0) {
    const nextSteps = [...steps, { fromId, segmentId, toId }];
    const nextVisited = new Set(visited).add(`${segmentId}:${fromId}`);
    const candidates = getNextUnitHalfEdgeCandidates(
      context.fullAdjacency,
      context.unitByBoundaryPieceId,
      fromId,
      toId,
      context.unitById.get(segmentId)!,
    );

    for (const candidate of candidates) {
      const nextKey = `${candidate.segmentId}:${toId}`;

      if (nextKey === context.startKey) {
        const closesEveryUnitExactlyOnce =
          nextSteps.length === context.unitsCount && new Set(nextSteps.map((step) => step.segmentId)).size === context.unitsCount;

        if (closesEveryUnitExactlyOnce) {
          return nextSteps;
        }

        continue;
      }

      if (nextVisited.has(nextKey)) {
        continue;
      }

      const result = searchClosedStepChain(toId, candidate.toId, candidate.segmentId, nextVisited, nextSteps, context);

      if (result) {
        return result;
      }
    }
  }

  return null;
};
