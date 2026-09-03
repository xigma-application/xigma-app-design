// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode, TSectionNode } from 'types/design/types';

export const isDropTargetContainer = (node: TSceneNode): node is TFrameNode | TSectionNode =>
  node.type === NodeType.frame || node.type === NodeType.section;
