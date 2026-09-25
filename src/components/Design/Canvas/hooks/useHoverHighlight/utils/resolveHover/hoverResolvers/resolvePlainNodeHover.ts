// types
import { NodeType } from 'types/design/enums';
import { THoverResolverContext, THoverResult } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeAtPoint } from '../../../../../utils/getNodeAtPoint/getNodeAtPoint';
import { getNodeValues } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getNodeValues';
import { getTopLevelAncestor } from 'store/design/utils/nodeHierarchy/getTopLevelAncestor';
import { isAncestorNode } from 'store/design/utils/nodeHierarchy/isAncestorNode';
import { isClickThroughFrame } from 'store/design/utils/nodeHierarchy/isClickThroughFrame';
import { isPointOnNodeNameLabel } from '../../../../../utils/isPointOnNodeNameLabel';
import { isSelectionInsideGroup } from '../../../../../utils/isSelectionInsideGroup';

const toHoverResult = (nodeId: string | null): THoverResult => ({ className: null, cursor: '', nodeId });

const findFrameLabelHit = ({ nodesById, point, viewport }: THoverResolverContext): TSceneNode | undefined =>
  getNodeValues(nodesById).find((node) => isClickThroughFrame(node, nodesById) && isPointOnNodeNameLabel(point, node, viewport.zoom));

const getPlainNodeId = (hit: TSceneNode, { isControlPressed, nodesById, selectedNodes }: THoverResolverContext): string => {
  const ancestor = getTopLevelAncestor(hit, nodesById);
  const isHitTargeted =
    (hit.type === NodeType.frame && ancestor.type === NodeType.section) ||
    isControlPressed ||
    isClickThroughFrame(ancestor, nodesById) ||
    isSelectionInsideGroup(ancestor.id, selectedNodes, nodesById);

  return isHitTargeted ? hit.id : ancestor.id;
};

const resolveHitHover = (hit: TSceneNode, selectedHit: ReturnType<typeof getNodeAtPoint>, context: THoverResolverContext): THoverResult => {
  const plainNodeId = getPlainNodeId(hit, context);

  if (selectedHit && (plainNodeId === selectedHit.id || isAncestorNode(plainNodeId, selectedHit, context.nodesById))) {
    return toHoverResult(selectedHit.id);
  }

  return toHoverResult(plainNodeId);
};

export const resolvePlainNodeHover = (context: THoverResolverContext): THoverResult => {
  const { leafNodes, nodesById, point, selectedNodes, viewport } = context;
  const selectedHit = getNodeAtPoint(point, selectedNodes, viewport, { ignoreClip: true });
  const frameLabelHit = findFrameLabelHit(context);

  if (!frameLabelHit) {
    const hit = getNodeAtPoint(point, leafNodes, viewport, { clipNodesById: nodesById });
    return hit ? resolveHitHover(hit, selectedHit, context) : toHoverResult(selectedHit?.id ?? null);
  }

  return toHoverResult(frameLabelHit.id);
};
