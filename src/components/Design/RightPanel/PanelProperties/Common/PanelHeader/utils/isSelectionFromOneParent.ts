// types
import { TSceneNode } from 'types/design/types';

export const isSelectionFromOneParent = (nodes: (TSceneNode | undefined)[]): boolean =>
  nodes.every((node) => node?.parentId === nodes[0]?.parentId);
