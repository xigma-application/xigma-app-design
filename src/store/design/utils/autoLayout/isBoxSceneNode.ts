// types
import { TBoxSceneNode, TSceneNode } from 'types/design/types';

export const isBoxSceneNode = (node: TSceneNode): node is TBoxSceneNode => 'width' in node;
