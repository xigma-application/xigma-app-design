// types
import { TFrameNode, TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { isChildAlignmentContainer } from './isChildAlignmentContainer';

export const canAlignFrameChildren = (node: TSceneNode | undefined): node is TFrameNode | TSectionNode =>
  isChildAlignmentContainer(node) && !node.parentId;
