// types
import { TResolvedPieceUnit } from './types';
import { TVectorFaceStep } from '../walkVectorFace';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { buildVectorHalfEdgeAdjacency } from '../buildVectorHalfEdgeAdjacency';
import { getNextUnitHalfEdge } from './getNextUnitHalfEdge';

export const chainIntoSteps = (
  units: TResolvedPieceUnit[],
  vertices: Record<string, TVectorVertex>,
  planarSegments: Record<string, TVectorSegment>,
): TVectorFaceStep[] | null => {
  const [first] = units;
  const firstStep: TVectorFaceStep = { fromId: first.startId, segmentId: first.id, toId: first.endId };

  if (units.length === 1) {
    return firstStep.toId === first.startId ? [firstStep] : null;
  }

  const fullAdjacency = buildVectorHalfEdgeAdjacency(Object.values(planarSegments), vertices);
  const unitById = new Map(units.map((unit) => [unit.id, unit]));
  const unitByBoundaryPieceId = new Map<string, TResolvedPieceUnit>();

  units.forEach((unit) => {
    unitByBoundaryPieceId.set(unit.pieces[0].id, unit);
    unitByBoundaryPieceId.set(unit.pieces[unit.pieces.length - 1].id, unit);
  });

  const startKey = `${first.id}:${first.startId}`;
  const visited = new Set<string>();
  const steps: TVectorFaceStep[] = [];
  let fromId = firstStep.fromId;
  let toId = firstStep.toId;
  let segmentId = firstStep.segmentId;

  for (let step = 0; step <= units.length * 2; step += 1) {
    const next = getNextUnitHalfEdge(fullAdjacency, unitByBoundaryPieceId, fromId, toId, unitById.get(segmentId)!);
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
