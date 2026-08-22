// types
import { TVectorNode } from 'types/design/types';

export type THoverHit = { vertexId: string } | null;
export type TCrossNodeVertexHit = { node: TVectorNode; vertexId: string } | null;
export type TEdgeHit = { segmentId: string; t: number } | null;
export type TCrossNodeEdgeHit = { hit: { segmentId: string; t: number }; node: TVectorNode } | null;
