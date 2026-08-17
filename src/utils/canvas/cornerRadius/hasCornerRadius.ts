// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSceneNode } from 'types/design/types';

export const hasCornerRadius = (node: TSceneNode): node is TRectangleNode => node.type === NodeType.rectangle;
