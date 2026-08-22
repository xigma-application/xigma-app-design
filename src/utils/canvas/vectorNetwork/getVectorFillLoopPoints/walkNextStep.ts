// types
import { TChainable } from './types';
import { TVectorFaceStep } from '../walkVectorFace';

export const walkNextStep = (
  chainables: TChainable[],
  remaining: Set<string>,
  currentVertexId: string,
  steps: TVectorFaceStep[],
): TVectorFaceStep[] | null => {
  const next = chainables.find(
    (chainable) => remaining.has(chainable.id) && (chainable.startId === currentVertexId || chainable.endId === currentVertexId),
  );

  if (next) {
    const toId = next.startId === currentVertexId ? next.endId : next.startId;
    const nextRemaining = new Set(remaining);

    nextRemaining.delete(next.id);

    const nextSteps = [...steps, { fromId: currentVertexId, segmentId: next.id, toId }];
    return nextRemaining.size > 0 ? walkNextStep(chainables, nextRemaining, toId, nextSteps) : nextSteps;
  }

  return null;
};
