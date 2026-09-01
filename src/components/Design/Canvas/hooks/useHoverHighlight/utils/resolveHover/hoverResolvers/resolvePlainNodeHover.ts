// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getNodeAtPoint } from '../../../../../utils/getNodeAtPoint/getNodeAtPoint';
import { getTopLevelAncestor } from 'store/design/utils/nodeHierarchy/getTopLevelAncestor';
import { isAncestorNode } from 'store/design/utils/nodeHierarchy/isAncestorNode';
import { isSelectionInsideGroup } from '../../../../../utils/isSelectionInsideGroup';

export const resolvePlainNodeHover = ({
  isControlPressed,
  leafNodes,
  nodesById,
  point,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult => {
  const selectedHit = getNodeAtPoint(point, selectedNodes, viewport);
  const hit = getNodeAtPoint(point, leafNodes, viewport);

  if (hit) {
    const ancestor = getTopLevelAncestor(hit, nodesById);
    const plainNodeId = isControlPressed || isSelectionInsideGroup(ancestor.id, selectedNodes, nodesById) ? hit.id : ancestor.id;

    if (selectedHit && (plainNodeId === selectedHit.id || isAncestorNode(plainNodeId, selectedHit, nodesById))) {
      return { className: null, cursor: '', nodeId: selectedHit.id };
    }

    return { className: null, cursor: '', nodeId: plainNodeId };
  }

  return { className: null, cursor: '', nodeId: selectedHit?.id ?? null };
};
