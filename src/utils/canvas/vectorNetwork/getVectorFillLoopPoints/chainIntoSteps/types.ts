// types
import { TResolvedPieceUnit } from '../types';
import { TVectorHalfEdge } from '../../buildVectorHalfEdgeAdjacency';

export type TSearchContext = {
  budget: { remaining: number };
  fullAdjacency: Map<string, TVectorHalfEdge[]>;
  startKey: string;
  unitById: Map<string, TResolvedPieceUnit>;
  unitByBoundaryPieceId: Map<string, TResolvedPieceUnit>;
  unitsCount: number;
};
