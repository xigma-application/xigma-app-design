// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

export const isAutoLayoutFrame = (node: TSceneNode): node is TFrameNode =>
  node.type === NodeType.frame && (node.layoutMode === LayoutMode.horizontal || node.layoutMode === LayoutMode.vertical);
