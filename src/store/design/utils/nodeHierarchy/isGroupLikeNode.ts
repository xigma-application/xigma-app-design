// types
import { NodeType } from 'types/design/enums';
import { TGroupLikeNode, TSceneNode } from 'types/design/types';

export const isGroupLikeNode = (node: TSceneNode): node is TGroupLikeNode => node.type === NodeType.group || node.type === NodeType.mask;
