// types
import { TChainable } from './types';
import { TVectorFaceStep } from '../walkVectorFace';

// utils
import { walkNextStep } from './walkNextStep';

export const chainIntoSteps = (chainables: TChainable[]): TVectorFaceStep[] | null => {
  const [first, ...rest] = chainables;
  const remaining = new Set(rest.map((chainable) => chainable.id));
  const firstStep: TVectorFaceStep = { fromId: first.startId, segmentId: first.id, toId: first.endId };
  const steps = remaining.size > 0 ? walkNextStep(chainables, remaining, first.endId, [firstStep]) : [firstStep];

  return steps && steps[steps.length - 1].toId === first.startId ? steps : null;
};
