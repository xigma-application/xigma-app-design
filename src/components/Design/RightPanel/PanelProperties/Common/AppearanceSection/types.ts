// types
import { NodeType } from 'types/design/enums';
import { TBooleanNode, TFrameNode, TLineNode, TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';

export type TAppearanceNode = TBooleanNode | TFrameNode | TRectangleNode | TSectionNode;

export type TStyledNode = TAppearanceNode | TLineNode;

export const isAppearanceNode = (node: TSceneNode | undefined): node is TAppearanceNode =>
  node?.type === NodeType.boolean || node?.type === NodeType.frame || node?.type === NodeType.rectangle || node?.type === NodeType.section;
