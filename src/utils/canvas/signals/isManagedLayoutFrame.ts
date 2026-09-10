// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

export const isManagedLayoutFrame = (node: TSceneNode | undefined): node is TFrameNode =>
  node !== undefined &&
  node.type === NodeType.frame &&
  (node.layoutMode === LayoutMode.horizontal || node.layoutMode === LayoutMode.vertical || node.layoutMode === LayoutMode.grid);
