// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getNodeAtPoint } from '../../../../../utils/getNodeAtPoint/getNodeAtPoint';
import { getTopLevelAncestor } from 'store/design/utils/nodeHierarchy/getTopLevelAncestor';
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

  if (!selectedHit) {
    const hit = getNodeAtPoint(point, leafNodes, viewport);

    if (!hit) {
      return { className: null, cursor: '', nodeId: null };
    }

    const ancestor = getTopLevelAncestor(hit, nodesById);
    const nodeId = isControlPressed || isSelectionInsideGroup(ancestor.id, selectedNodes, nodesById) ? hit.id : ancestor.id;

    return { className: null, cursor: '', nodeId };
  }

  return { className: null, cursor: '', nodeId: selectedHit.id };
};
