// types
import { TSceneNode } from 'types/design/types';

// utils
import { isAxisAlignedRotation } from '../isAxisAlignedRotation';
import { isNodeManagedLayoutChild } from 'utils/canvas/signals/isNodeManagedLayoutChild';

export const isEligibleForSmartSelection = (nodes: TSceneNode[], nodesById: Record<string, TSceneNode>): boolean =>
  nodes.length >= 2 &&
  nodes.every((node) => 'rotation' in node && isAxisAlignedRotation(node.rotation)) &&
  !nodes.some((node) => isNodeManagedLayoutChild(node, nodesById));
