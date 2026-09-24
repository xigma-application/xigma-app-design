// types
import { TBoxSceneNode, TSceneNode } from 'types/design/types';

// utils
import { isBoxSceneNode } from './isBoxSceneNode';

export const isExistingBoxSceneNode = (node: TSceneNode | undefined): node is TBoxSceneNode => node !== undefined && isBoxSceneNode(node);
