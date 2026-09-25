// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode, TSceneNode, TSectionNode } from 'types/design/types';

export const isSelectionColorsRootNode = (node: TSceneNode | undefined): node is TFrameNode | TGroupNode | TSectionNode =>
  node?.type === NodeType.frame || node?.type === NodeType.group || node?.type === NodeType.section;
