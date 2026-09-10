// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

export const isGridFrame = (node: TSceneNode | null): node is TFrameNode =>
  node !== null && node.type === NodeType.frame && node.layoutMode === LayoutMode.grid;
