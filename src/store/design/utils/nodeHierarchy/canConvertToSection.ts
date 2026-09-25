// types
import { TSceneNode } from 'types/design/types';

// utils
import { canHoldSection } from './canHoldSection';

export const canConvertToSection = (selectedNodes: (TSceneNode | undefined)[], nodes: Record<string, TSceneNode>): boolean =>
  selectedNodes.length > 0 && selectedNodes.every((node) => node !== undefined && canHoldSection(node.parentId, nodes));
