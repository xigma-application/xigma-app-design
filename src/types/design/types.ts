// types
import { NodeType, PathType } from './enums';
import { TDraftRect, TPoint } from 'types/canvas';

export type TComment = TPoint & {
  author: string;
  content: string;
  createdAt: number;
  id: string;
};

export type TDraftShape = TDraftRect & {
  fill: string;
  type: NodeType.ellipse | NodeType.frame | NodeType.rectangle | NodeType.section;
};

export type TDraftPath = TDraftRect & {
  pathType: PathType;
  type: NodeType.path;
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
  arcEndAngle?: number;
  arcRatio?: number;
  arcRatioInverted?: boolean;
  arcStartAngle?: number;
  fill: string;
  flipX?: boolean;
  flipY?: boolean;
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

export type TPathNode = TBaseNode & {
  pathType: PathType;
  type: NodeType.path;
};

export type TPolygonNode = TBaseNode & {
  cornerRadius?: number;
  fill: string;
  flipX: boolean;
  flipY: boolean;
  sides: number;
  type: NodeType.polygon;
};

export type TRectangleNode = TBaseNode & {
  cornerRadius?: number;
  fill: string;
  type: NodeType.rectangle;
};

export type TSectionNode = TBaseNode & {
  fill: string;
  type: NodeType.section;
};

export type TStarNode = TBaseNode & {
  cornerRadius?: number;
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
  pathFlip?: boolean;
  pathId?: string | null;
  pathStartOffset?: number;
  type: NodeType.text;
};

export type TLineEndpointStyle = 'arrow' | 'default';

export type TLineNode = {
  endPoint?: TLineEndpointStyle;
  id: string;
  name: string;
  parentId: string | null;
  startPoint?: TLineEndpointStyle;
  stroke: string;
  type: NodeType.line;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export type TDraftLine = Omit<TLineNode, 'id' | 'name' | 'parentId'>;

export type TDraftEntity = TDraftShape | TDraftLine | TDraftPath | TDraftPolygon | TDraftStar | TDraftMedia | TDraftText;

export type TBoxSceneNode =
  TEllipseNode | TFrameNode | TMediaNode | TPathNode | TPolygonNode | TRectangleNode | TSectionNode | TStarNode | TTextNode;

export type TSceneNode = TBoxSceneNode | TLineNode;

export type TNewSceneNode =
  | Omit<TEllipseNode, 'id'>
  | Omit<TFrameNode, 'id'>
  | Omit<TMediaNode, 'id'>
  | Omit<TPathNode, 'id'>
  | Omit<TPolygonNode, 'id'>
  | Omit<TRectangleNode, 'id'>
  | Omit<TSectionNode, 'id'>
  | Omit<TStarNode, 'id'>
  | Omit<TTextNode, 'id'>
  | Omit<TLineNode, 'id'>;

export type TSceneNodeChanges =
  | Partial<TEllipseNode>
  | Partial<TFrameNode>
  | Partial<TMediaNode>
  | Partial<TPathNode>
  | Partial<TPolygonNode>
  | Partial<TRectangleNode>
  | Partial<TSectionNode>
  | Partial<TStarNode>
  | Partial<TTextNode>
  | Partial<TLineNode>;

export type TViewport = {
  x: number;
  y: number;
  zoom: number;
};
