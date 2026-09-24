// types
import { TBoxSceneNode, TSceneNode } from 'types/design/types';
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { getNodeAbsoluteFromParentPosition } from 'store/design/utils/getNodeAbsoluteFromParentPosition';
import { getNodePositionInParent } from 'store/design/utils/getNodePositionInParent';
import { isManagedLayoutFrame } from 'utils/canvas/signals/isManagedLayoutFrame';

type TParent = Parameters<typeof getNodeAbsoluteFromParentPosition>[1];

export type TPositionEntry = {
  disabledX: boolean;
  disabledY: boolean;
  id: string;
  parent: TParent | undefined;
  x: number;
  y: number;
};

export const getPositionEntry = (
  node: TBoxSceneNode,
  nodes: Record<string, TSceneNode>,
  imageCrop: TSelectedImageCrop | undefined,
): TPositionEntry => {
  const parentNode = node.parentId ? nodes[node.parentId] : undefined;
  const parent = parentNode && 'width' in parentNode ? parentNode : undefined;
  const positionSource = imageCrop ? imageCrop.crop : node;
  const local = parent ? getNodePositionInParent(positionSource, parent) : undefined;
  const isFlowManaged = isManagedLayoutFrame(parent) && !node.ignoreAutoLayout;

  return {
    disabledX: !imageCrop && (isFlowManaged || node.alignment?.horizontal !== undefined),
    disabledY: !imageCrop && (isFlowManaged || node.alignment?.vertical !== undefined),
    id: node.id,
    parent,
    x: local ? Math.round(local.x) : positionSource.x,
    y: local ? Math.round(local.y) : positionSource.y,
  };
};
