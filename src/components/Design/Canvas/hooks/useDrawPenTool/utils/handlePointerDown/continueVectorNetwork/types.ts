// types
import { TVectorNode } from 'types/design/types';

export type TContinueVectorNetworkHit =
  | { kind: 'vertex'; vertexId: string }
  | { kind: 'crossNodeVertex'; targetNode: TVectorNode; vertexId: string }
  | { kind: 'edge'; segmentId: string; t: number }
  | { kind: 'crossNodeEdge'; targetNode: TVectorNode; segmentId: string; t: number }
  | { kind: 'extend' };
