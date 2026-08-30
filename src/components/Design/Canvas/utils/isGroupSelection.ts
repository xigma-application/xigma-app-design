// types
import { TSceneNode } from 'types/design/types';

export const isGroupSelection = (nodes: TSceneNode[]): boolean => nodes.length > 1;
