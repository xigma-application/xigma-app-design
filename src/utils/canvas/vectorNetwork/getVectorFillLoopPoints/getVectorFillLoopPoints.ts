// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';
import { TResolvedPieceUnit } from './types';
import { TVectorPieceBoundaries } from '../getVectorPieceBoundaryKeys';

// utils
import { chainIntoSteps } from './chainIntoSteps';
import { expandUnitStep } from './expandUnitStep';
import { flattenVectorFaceSteps } from '../flattenVectorFaceSteps';
import { planarizeVectorNetwork } from '../planarizeVectorNetwork/planarizeVectorNetwork';
import { resolvePieceKeyToUnit } from './resolvePieceKeyToUnit';

const cache = new WeakMap<TVectorNode, Map<string, TPoint[] | null>>();
const planarCache = new WeakMap<TVectorNode, ReturnType<typeof planarizeVectorNetwork>>();

const getPlanarNetwork = (node: TVectorNode): ReturnType<typeof planarizeVectorNetwork> => {
  const cached = planarCache.get(node);

  if (!cached) {
    const planar = planarizeVectorNetwork(Object.values(node.segments), node.vertices);
    planarCache.set(node, planar);

    return planar;
  }

  return cached;
};

const resolveUnits = (
  loopKey: string,
  planarSegments: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
  boundaryKeysByRealSegmentId: Map<string, Record<string, TVectorPieceBoundaries>>,
): (TResolvedPieceUnit | null)[] =>
  loopKey.split(',').map((pieceKey) => resolvePieceKeyToUnit(pieceKey, planarSegments, vertices, boundaryKeysByRealSegmentId));

export const getVectorFillLoopPoints = (node: TVectorNode, loopKey: string): TPoint[] | null => {
  const nodeCache = cache.get(node) ?? new Map<string, TPoint[] | null>();
  cache.set(node, nodeCache);

  if (!nodeCache.has(loopKey)) {
    const planar = getPlanarNetwork(node);
    const boundaryKeysByRealSegmentId = new Map<string, Record<string, TVectorPieceBoundaries>>();
    const units = resolveUnits(loopKey, planar.segments, node.vertices, boundaryKeysByRealSegmentId);
    const hasEveryUnit = units.every((unit): unit is TResolvedPieceUnit => unit !== null);
    const outerSteps = hasEveryUnit ? chainIntoSteps(units) : null;
    const unitsById = hasEveryUnit ? new Map(units.map((unit) => [unit.id, unit])) : null;
    const atomicSteps = outerSteps && unitsById ? outerSteps.flatMap((step) => expandUnitStep(step, unitsById)) : null;

    nodeCache.set(loopKey, atomicSteps && flattenVectorFaceSteps(atomicSteps, planar.segments, planar.vertices));
  }

  return nodeCache.get(loopKey) ?? null;
};
