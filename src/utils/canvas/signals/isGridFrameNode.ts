// types
import { LayoutMode } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { isFrameNode } from './isFrameNode';

export const isGridFrameNode = (node: TSceneNode | undefined): node is TFrameNode =>
  isFrameNode(node) && node.layoutMode === LayoutMode.grid;
