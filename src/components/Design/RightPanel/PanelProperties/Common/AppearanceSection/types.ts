// types
import { NodeType } from 'types/design/enums';
import { TBooleanNode, TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';

export type TAppearanceNode = TBooleanNode | TFrameNode | TRectangleNode;

export const isAppearanceNode = (node: TSceneNode | undefined): node is TAppearanceNode =>
  node?.type === NodeType.boolean || node?.type === NodeType.frame || node?.type === NodeType.rectangle;
