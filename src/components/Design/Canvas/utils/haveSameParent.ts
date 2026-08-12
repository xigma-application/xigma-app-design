// types
import { TSceneNode } from 'types/design/types';

export const haveSameParent = (nodes: TSceneNode[]): boolean => nodes.every((node) => node.parentId === nodes[0].parentId);
