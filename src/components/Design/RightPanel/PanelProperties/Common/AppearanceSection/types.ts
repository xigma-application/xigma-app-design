// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';

export type TAppearanceNode = TFrameNode | TRectangleNode;

export const isAppearanceNode = (node: TSceneNode | undefined): node is TAppearanceNode =>
  node?.type === NodeType.frame || node?.type === NodeType.rectangle;
