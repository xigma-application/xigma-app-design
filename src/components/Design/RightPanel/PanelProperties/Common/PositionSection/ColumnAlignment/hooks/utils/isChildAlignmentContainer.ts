// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { isFreeFormFrameWithChildren } from './isFreeFormFrameWithChildren';

export const isChildAlignmentContainer = (node: TSceneNode | undefined): node is TFrameNode | TSectionNode =>
  isFreeFormFrameWithChildren(node) || (node?.type === NodeType.section && node.childIds.length > 0);
