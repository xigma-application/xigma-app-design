// types
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorSegmentVertexIds } from 'utils/canvas/vectorNetwork/getVectorSegmentVertexIds';

export const getVectorMultiSelectVertexIds = (node: TVectorNode, selectedVertexIds: string[], selectedSegmentIds: string[]): string[] =>
  Array.from(new Set([...selectedVertexIds, ...getVectorSegmentVertexIds(node, selectedSegmentIds)]));
