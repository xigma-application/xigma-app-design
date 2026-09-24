// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

export const isFreeFormFrameWithChildren = (node: TSceneNode | undefined): node is TFrameNode =>
  node?.type === NodeType.frame && (node.layoutMode ?? LayoutMode.freeForm) === LayoutMode.freeForm && node.childIds.length > 0;
