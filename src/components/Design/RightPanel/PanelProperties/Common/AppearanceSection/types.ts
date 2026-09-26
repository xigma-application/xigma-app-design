// types
import { NodeType } from 'types/design/enums';
import {
  TBooleanNode,
  TEllipseNode,
  TFrameNode,
  TLineNode,
  TPolygonNode,
  TRectangleNode,
  TSceneNode,
  TSectionNode,
  TStarNode,
  TVectorNode,
} from 'types/design/types';

export type TAppearanceNode = TBooleanNode | TFrameNode | TRectangleNode | TSectionNode;

export type TStyledNode = TAppearanceNode | TEllipseNode | TLineNode | TPolygonNode | TStarNode;

export type TOpacityPanelNode = TStyledNode | TVectorNode;

export type TStrokeSettingsNode = TStyledNode | TVectorNode;

export const isAppearanceNode = (node: TSceneNode | undefined): node is TAppearanceNode =>
  node?.type === NodeType.boolean || node?.type === NodeType.frame || node?.type === NodeType.rectangle || node?.type === NodeType.section;
