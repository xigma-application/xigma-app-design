// types
import { TSceneNode } from 'types/design/types';

// utils
import { haveSameParent } from './haveSameParent';

export const isGroupSelection = (nodes: TSceneNode[]): boolean => nodes.length > 1 && haveSameParent(nodes);
