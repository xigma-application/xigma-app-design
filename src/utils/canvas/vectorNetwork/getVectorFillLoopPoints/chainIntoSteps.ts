// types
import { TResolvedPieceUnit } from './types';
import { TVectorFaceStep } from '../walkVectorFace';
import { TVectorVertex } from 'types/design/types';

// utils
import { buildUnitHalfEdgeAdjacency } from './buildUnitHalfEdgeAdjacency';
import { getNextVectorHalfEdge } from '../getNextVectorHalfEdge';

export const chainIntoSteps = (units: TResolvedPieceUnit[], vertices: Record<string, TVectorVertex>): TVectorFaceStep[] | null => {
  const [first] = units;
  const firstStep: TVectorFaceStep = { fromId: first.startId, segmentId: first.id, toId: first.endId };

  if (units.length === 1) {
    return firstStep.toId === first.startId ? [firstStep] : null;
  }

  const adjacency = buildUnitHalfEdgeAdjacency(units, vertices);
  const startKey = `${first.id}:${first.startId}`;
  const visited = new Set<string>();
  const steps: TVectorFaceStep[] = [];
  let fromId = firstStep.fromId;
  let toId = firstStep.toId;
  let segmentId = firstStep.segmentId;

  for (let step = 0; step <= units.length * 2; step += 1) {
    const next = getNextVectorHalfEdge(adjacency, fromId, toId, segmentId);
    const nextKey = next ? `${next.segmentId}:${toId}` : null;

    visited.add(`${segmentId}:${fromId}`);
    steps.push({ fromId, segmentId, toId });

    switch (true) {
      case !next:
        return null;
      case nextKey === startKey:
        return steps.length === units.length && new Set(steps.map((s) => s.segmentId)).size === units.length ? steps : null;
      case visited.has(nextKey!):
        return null;
      default:
        fromId = toId;
        toId = next!.toId;
        segmentId = next!.segmentId;
    }
  }

  return null;
};
