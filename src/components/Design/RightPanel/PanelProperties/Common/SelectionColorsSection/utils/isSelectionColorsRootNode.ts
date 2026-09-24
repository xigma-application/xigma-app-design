// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode, TSceneNode } from 'types/design/types';

export const isSelectionColorsRootNode = (node: TSceneNode | undefined): node is TFrameNode | TGroupNode =>
  node?.type === NodeType.frame || node?.type === NodeType.group;
