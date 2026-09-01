// types
import { TResolvedPieceUnit } from '../types';
import { TSearchContext } from './types';
import { TVectorFaceStep } from '../../walkVectorFace';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { buildVectorHalfEdgeAdjacency } from '../../buildVectorHalfEdgeAdjacency';
import { searchClosedStepChain } from './searchClosedStepChain';

const SEARCH_BUDGET = 20000;

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

  const context: TSearchContext = {
    budget: { remaining: SEARCH_BUDGET },
    fullAdjacency,
    startKey: `${first.id}:${first.startId}`,
    unitByBoundaryPieceId,
    unitById,
    unitsCount: units.length,
  };

  return searchClosedStepChain(firstStep.fromId, firstStep.toId, firstStep.segmentId, new Set(), [], context);
};
