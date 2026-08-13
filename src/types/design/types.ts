// types
import { NodeType } from './enums';
import { TDraftRect } from 'types/canvas';

export type TDraftShape = TDraftRect & {
  fill: string;
  type: NodeType.ellipse | NodeType.frame | NodeType.rectangle;
};

export type TDraftPolygon = TDraftRect & {
  fill: string;
  sides: number;
  type: NodeType.polygon;
};

export type TDraftStar = TDraftRect & {
  fill: string;
  points: number;
  ratio: number;
  type: NodeType.star;
};

export type TDraftMedia = TDraftRect & {
  src: string;
  type: NodeType.media;
};

export type TDraftText = TDraftRect & {
  type: NodeType.text;
};

export type TBaseNode = {
  height: number;
  id: string;
  name: string;
  parentId: string | null;
  rotation: number;
  width: number;
  x: number;
  y: number;
};

export type TEllipseNode = TBaseNode & {
  fill: string;
  type: NodeType.ellipse;
};

export type TFrameNode = TBaseNode & {
  fill: string;
  type: NodeType.frame;
};

export type TMediaNode = TBaseNode & {
  flipX: boolean;
  flipY: boolean;
  src: string;
  type: NodeType.media;
};

export type TPolygonNode = TBaseNode & {
  fill: string;
  flipX: boolean;
  flipY: boolean;
  sides: number;
  type: NodeType.polygon;
};

export type TRectangleNode = TBaseNode & {
  fill: string;
  type: NodeType.rectangle;
};

export type TStarNode = TBaseNode & {
  fill: string;
  flipX: boolean;
  flipY: boolean;
  points: number;
  ratio: number;
  type: NodeType.star;
};

export type TTextNode = TBaseNode & {
  content: string;
  fill: string;
  flipX: boolean;
  flipY: boolean;
  fontFamily: string;
  fontSize: number;
  type: NodeType.text;
};

export type TLineNode = {
  id: string;
  name: string;
  parentId: string | null;
  stroke: string;
  type: NodeType.line;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export type TDraftLine = Omit<TLineNode, 'id' | 'name' | 'parentId'>;

export type TDraftEntity = TDraftShape | TDraftLine | TDraftPolygon | TDraftStar | TDraftMedia | TDraftText;

export type TBoxSceneNode = TEllipseNode | TFrameNode | TMediaNode | TPolygonNode | TRectangleNode | TStarNode | TTextNode;

export type TSceneNode = TBoxSceneNode | TLineNode;

export type TNewSceneNode =
  | Omit<TEllipseNode, 'id'>
  | Omit<TFrameNode, 'id'>
  | Omit<TMediaNode, 'id'>
  | Omit<TPolygonNode, 'id'>
  | Omit<TRectangleNode, 'id'>
  | Omit<TStarNode, 'id'>
  | Omit<TTextNode, 'id'>
  | Omit<TLineNode, 'id'>;

export type TSceneNodeChanges =
  | Partial<TEllipseNode>
  | Partial<TFrameNode>
  | Partial<TMediaNode>
  | Partial<TPolygonNode>
  | Partial<TRectangleNode>
  | Partial<TStarNode>
  | Partial<TTextNode>
  | Partial<TLineNode>;

export type TViewport = {
  x: number;
  y: number;
  zoom: number;
};
