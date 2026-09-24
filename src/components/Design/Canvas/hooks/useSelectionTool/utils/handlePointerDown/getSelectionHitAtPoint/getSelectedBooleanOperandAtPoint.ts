// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeAxisAlignedBounds } from 'store/design/utils/getNodeAxisAlignedBounds';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getUnrotatedNodeQueryPoint } from '../../../../../utils/getNodeAtPoint/getUnrotatedNodeQueryPoint';
import { hasBooleanAncestor } from 'store/design/utils/nodeHierarchy/hasBooleanAncestor';
import { isPointInRect } from '../../../../../utils/isPointInRect';

const isPointInNodeFrame = (point: TPoint, node: TSceneNode): boolean =>
  isPointInRect(
    getUnrotatedNodeQueryPoint(point, node),
    getNodeAxisAlignedBounds(node.type === NodeType.vector ? getRenderedVectorNode(node) : node),
  );

export const getSelectedBooleanOperandAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
): TSceneNode | null =>
  [...selectedNodes].reverse().find((node) => hasBooleanAncestor(node, nodesById) && isPointInNodeFrame(point, node)) ?? null;
