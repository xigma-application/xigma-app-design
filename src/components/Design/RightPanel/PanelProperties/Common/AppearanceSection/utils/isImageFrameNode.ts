// types
import { NodeType } from 'types/design/enums';
import { isAppearanceNode, TImageFrameNode } from '../types';
import { TSceneNode } from 'types/design/types';

export const isImageFrameNode = (node: TSceneNode | undefined): node is TImageFrameNode =>
  isAppearanceNode(node) || node?.type === NodeType.ellipse || node?.type === NodeType.polygon || node?.type === NodeType.star;
