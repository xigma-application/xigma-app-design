// types
import { TBoxSceneNode, TSceneNode, TVectorNode } from 'types/design/types';
import { TPositionEntry } from '../../types';
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { getNodeBounds } from 'components/Design/Canvas/utils/getNodeBounds';
import { getNodePositionInParent } from 'store/design/utils/getNodePositionInParent';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { isManagedLayoutFrame } from 'utils/canvas/signals/isManagedLayoutFrame';

export const getPositionEntry = (
  node: TBoxSceneNode | TVectorNode,
  nodes: Record<string, TSceneNode>,
  imageCrop: TSelectedImageCrop | undefined,
): TPositionEntry => {
  const parentNode = node.parentId ? nodes[node.parentId] : undefined;
  const parent = parentNode && 'width' in parentNode ? parentNode : undefined;
  const boxNode = isBoxSceneNode(node) ? node : undefined;
  const positionSource = imageCrop ? imageCrop.crop : getNodeBounds(node);
  const local = parent ? getNodePositionInParent(positionSource, parent) : undefined;
  const isFlowManaged = isManagedLayoutFrame(parent) && boxNode !== undefined && !boxNode.ignoreAutoLayout;

  return {
    disabledX: !imageCrop && (isFlowManaged || boxNode?.alignment?.horizontal !== undefined),
    disabledY: !imageCrop && (isFlowManaged || boxNode?.alignment?.vertical !== undefined),
    id: node.id,
    parent,
    x: local ? Math.round(local.x) : positionSource.x,
    y: local ? Math.round(local.y) : positionSource.y,
  };
};
