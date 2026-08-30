// others
import { DEFAULT_GROUP_NAME } from '../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TSceneNode } from 'types/design/types';

// utils
import { getNodesBoundingBox } from '../getNodesBoundingBox';

export const buildGroupNode = (
  groupId: string,
  parentId: string | null,
  orderedMemberIds: string[],
  nodes: Record<string, TSceneNode>,
): TGroupNode => {
  const bounds = getNodesBoundingBox(orderedMemberIds.map((id) => nodes[id]));

  return {
    childIds: orderedMemberIds,
    height: bounds.height,
    id: groupId,
    name: DEFAULT_GROUP_NAME,
    parentId,
    rotation: 0,
    type: NodeType.group,
    width: bounds.width,
    x: bounds.x,
    y: bounds.y,
  };
};
