// types
import { TVectorNode } from 'types/design/types';

// utils
import { buildSegmentsByVertex } from './buildSegmentsByVertex';
import { walkVectorChain, TVectorChainSegmentEntry } from './walkVectorChain';

export const walkVectorChainFrom = (node: TVectorNode, startVertexId: string): TVectorChainSegmentEntry[] => {
  const segments = Object.values(node.segments);
  return walkVectorChain(segments, buildSegmentsByVertex(segments), startVertexId);
};
