// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const canWrapInSection = (selectedNodes: (TSceneNode | undefined)[]): boolean =>
  selectedNodes.length > 0 && selectedNodes.every((node) => node !== undefined && node.parentId === null && node.type !== NodeType.section);
