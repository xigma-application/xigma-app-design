// types
import { NodeType } from 'types/design/enums';
import { TBooleanNode, TFrameNode, TGroupNode, TMaskNode, TSceneNode, TSectionNode } from 'types/design/types';

export const isContainerNode = (node: TSceneNode): node is TBooleanNode | TFrameNode | TGroupNode | TMaskNode | TSectionNode =>
  node.type === NodeType.boolean ||
  node.type === NodeType.frame ||
  node.type === NodeType.group ||
  node.type === NodeType.mask ||
  node.type === NodeType.section;
