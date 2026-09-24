// types
import { TSceneNode } from 'types/design/types';

// utils
import { isPanelNodeType } from './isPanelNodeType';

export const isPanelTypeSelection = (nodes: (TSceneNode | undefined)[]): boolean =>
  nodes.length > 0 && nodes.every((node) => node !== undefined && isPanelNodeType(node.type));
