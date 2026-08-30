// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getPathOffsetHandleHit } from '../../getPathOffsetHandleHit';

export const resolvePathOffsetHover = ({
  point,
  editingTextBox,
  editingNodeId,
  selectedNodes,
  nodesById,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const pathOffsetHandleHit = getPathOffsetHandleHit(point, editingTextBox, editingNodeId, selectedNodes, viewport, nodesById);

  if (pathOffsetHandleHit.hit) {
    return { className: 'hand', cursor: '', nodeId: pathOffsetHandleHit.nodeId };
  }
};
