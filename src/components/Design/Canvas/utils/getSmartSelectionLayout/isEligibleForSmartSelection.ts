// types
import { TSceneNode } from 'types/design/types';

// utils
import { isAxisAlignedRotation } from '../isAxisAlignedRotation';

export const isEligibleForSmartSelection = (nodes: TSceneNode[]): boolean =>
  nodes.length >= 2 && nodes.every((node) => 'rotation' in node && isAxisAlignedRotation(node.rotation));
