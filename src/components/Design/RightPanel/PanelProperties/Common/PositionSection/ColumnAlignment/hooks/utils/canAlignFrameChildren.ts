// types
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { isFreeFormFrameWithChildren } from './isFreeFormFrameWithChildren';

export const canAlignFrameChildren = (node: TSceneNode | undefined): node is TFrameNode =>
  isFreeFormFrameWithChildren(node) && !node.parentId;
