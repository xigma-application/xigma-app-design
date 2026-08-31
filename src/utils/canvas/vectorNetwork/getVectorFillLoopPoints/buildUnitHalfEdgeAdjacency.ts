// types
import { TResolvedPieceUnit } from './types';
import { TVectorHalfEdge } from '../buildVectorHalfEdgeAdjacency';
import { TVectorVertex } from 'types/design/types';

// utils
import { getVectorHalfEdgeAngle } from '../getVectorHalfEdgeAngle';

const getUnitDepartureAngle = (unit: TResolvedPieceUnit, fromId: string, vertices: Record<string, TVectorVertex>): number => {
  const departingFromStart = unit.startId === fromId;
  const piece = departingFromStart ? unit.pieces[0] : unit.pieces[unit.pieces.length - 1];
  const otherVertexId = departingFromStart ? piece.endId : piece.startId;

  return getVectorHalfEdgeAngle(piece, vertices[fromId], vertices[otherVertexId]);
};

export const buildUnitHalfEdgeAdjacency = (
  units: TResolvedPieceUnit[],
  vertices: Record<string, TVectorVertex>,
): Map<string, TVectorHalfEdge[]> => {
  const unitsById = new Map(units.map((unit) => [unit.id, unit]));
  const adjacency = new Map<string, TVectorHalfEdge[]>();

  const addHalfEdge = (fromId: string, edge: TVectorHalfEdge): void => {
    adjacency.set(fromId, [...(adjacency.get(fromId) ?? []), edge]);
  };

  units.forEach((unit) => {
    addHalfEdge(unit.startId, { segmentId: unit.id, toId: unit.endId });
    addHalfEdge(unit.endId, { segmentId: unit.id, toId: unit.startId });
  });

  adjacency.forEach((edges, fromId) => {
    edges.sort(
      (a, b) =>
        getUnitDepartureAngle(unitsById.get(a.segmentId)!, fromId, vertices) -
        getUnitDepartureAngle(unitsById.get(b.segmentId)!, fromId, vertices),
    );
  });

  return adjacency;
};
