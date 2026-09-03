// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode, TSceneNode } from 'types/design/types';

export const isContainerNode = (node: TSceneNode): node is TFrameNode | TGroupNode =>
  node.type === NodeType.frame || node.type === NodeType.group;
