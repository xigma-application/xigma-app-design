// types
import { TPoint } from 'types/canvas';
import { TPlanarVectorNetwork } from '../planarizeVectorNetwork/types';
import { TResolvedPieceUnit } from './types';
import { TVectorPieceBoundaries } from '../getVectorPieceBoundaryKeys';
import { TVectorVertex } from 'types/design/types';

// utils
import { chainIntoSteps } from './chainIntoSteps/chainIntoSteps';
import { expandUnitStep } from './expandUnitStep';
import { flattenVectorFaceSteps } from '../flattenVectorFaceSteps';
import { resolveUnits } from './resolveUnits';

export const computeLoopPoints = (
  loopKey: string,
  planar: TPlanarVectorNetwork,
  vertices: Record<string, TVectorVertex>,
): TPoint[] | null => {
  const boundaryKeysByRealSegmentId = new Map<string, Record<string, TVectorPieceBoundaries>>();
  const units = resolveUnits(loopKey, planar.segments, vertices, boundaryKeysByRealSegmentId);
  const hasEveryUnit = units.every((unit): unit is TResolvedPieceUnit => unit !== null);
  const outerSteps = hasEveryUnit ? chainIntoSteps(units, planar.vertices, planar.segments) : null;
  const unitsById = hasEveryUnit ? new Map(units.map((unit) => [unit.id, unit])) : null;
  const atomicSteps = outerSteps && unitsById ? outerSteps.flatMap((step) => expandUnitStep(step, unitsById)) : null;

  return atomicSteps && flattenVectorFaceSteps(atomicSteps, planar.segments, planar.vertices);
};
