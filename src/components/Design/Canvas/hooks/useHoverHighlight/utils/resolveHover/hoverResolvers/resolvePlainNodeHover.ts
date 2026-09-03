// types
import { NodeType } from 'types/design/enums';
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getNodeAtPoint } from '../../../../../utils/getNodeAtPoint/getNodeAtPoint';
import { getTopLevelAncestor } from 'store/design/utils/nodeHierarchy/getTopLevelAncestor';
import { isAncestorNode } from 'store/design/utils/nodeHierarchy/isAncestorNode';
import { isClickThroughFrame } from 'store/design/utils/nodeHierarchy/isClickThroughFrame';
import { isPointOnFrameNameLabel } from '../../../../../utils/isPointOnFrameNameLabel';
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

  const frameLabelHit = Object.values(nodesById).find(
    (node) => node.type === NodeType.frame && isClickThroughFrame(node, nodesById) && isPointOnFrameNameLabel(point, node, viewport.zoom),
  );

  if (frameLabelHit) {
    return { className: null, cursor: '', nodeId: frameLabelHit.id };
  }

  const hit = getNodeAtPoint(point, leafNodes, viewport);

  if (hit) {
    const ancestor = getTopLevelAncestor(hit, nodesById);
    const plainNodeId =
      (hit.type === NodeType.frame && ancestor.type === NodeType.section) ||
      isControlPressed ||
      isClickThroughFrame(ancestor, nodesById) ||
      isSelectionInsideGroup(ancestor.id, selectedNodes, nodesById)
        ? hit.id
        : ancestor.id;

    if (selectedHit && (plainNodeId === selectedHit.id || isAncestorNode(plainNodeId, selectedHit, nodesById))) {
      return { className: null, cursor: '', nodeId: selectedHit.id };
    }

    return { className: null, cursor: '', nodeId: plainNodeId };
  }

  return { className: null, cursor: '', nodeId: selectedHit?.id ?? null };
};
