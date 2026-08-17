// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TStarNode } from 'types/design/types';

export const hasStarCornerRadius = (node: TSceneNode): node is TStarNode => node.type === NodeType.star;
