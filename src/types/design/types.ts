// types
import { AlignmentLayout, LayoutMode, NodeType, PathType, SizingMode } from './enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TGuide } from 'types/design/guides/types';
import { TPaint } from 'types/design/paint/types';

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
  hidden?: boolean;
  id: string;
  isMask?: boolean;
  locked?: boolean;
  lockedAspectRatio?: boolean;
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
  strokeColor?: string;
  strokeWidth?: number;
  type: NodeType.ellipse;
};

export type TFrameNode = TBaseNode & {
  childIds: string[];
  clipContent: boolean;
  counterAxisSizingMode?: SizingMode;
  fill: string;
  guides?: TGuide[];
  itemSpacing?: number;
  layoutAlignment?: AlignmentLayout;
  layoutMode?: LayoutMode;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  primaryAxisSizingMode?: SizingMode;
  strokeColor?: string;
  strokeWidth?: number;
  type: NodeType.frame;
};

export type TGroupNode = TBaseNode & {
  childIds: string[];
  type: NodeType.group;
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
  strokeColor?: string;
  strokeWidth?: number;
  type: NodeType.rectangle;
};

export type TSectionNode = TBaseNode & {
  childIds: string[];
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
  strokeColor?: string;
  strokeWidth?: number;
  type: NodeType.text;
};

export type TVectorVertex = { id: string; x: number; y: number };

export type TVectorTangent = { x: number; y: number } | null;

export type TVectorSegment = {
  endId: string;
  id: string;
  startId: string;
  tangentEnd: TVectorTangent;
  tangentStart: TVectorTangent;
};

export type TVertexHandleMode = 'corner' | 'smooth' | 'symmetric';

export type TVectorWidthPoint = {
  id: string;
  leftOffset: number;
  position: number;
  rightOffset: number;
};

export type TVectorWidthProfile = {
  points: Record<string, TVectorWidthPoint>;
};

export type TVectorNode = {
  capStyle?: 'round';
  defaultFill: TPaint[] | null;
  fillByKey?: Record<string, TPaint[]>;
  filledFaceKeys: string[];
  hidden?: boolean;
  holeParentByKey?: Record<string, string>;
  id: string;
  isMask?: boolean;
  locked?: boolean;
  name: string;
  parentId: string | null;
  rotation: number;
  segments: Record<string, TVectorSegment>;
  strokeColor: string;
  strokeWidth: number;
  type: NodeType.vector;
  vertexHandleModes: Record<string, TVertexHandleMode>;
  vertices: Record<string, TVectorVertex>;
  widthProfile?: TVectorWidthProfile | null;
};

export type TLineEndpointStyle = 'arrow' | 'default';

export type TLineNode = {
  endPoint?: TLineEndpointStyle;
  hidden?: boolean;
  id: string;
  isMask?: boolean;
  locked?: boolean;
  name: string;
  parentId: string | null;
  startPoint?: TLineEndpointStyle;
  stroke: string;
  strokeWidth?: number;
  type: NodeType.line;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export type TDraftLine = Omit<TLineNode, 'id' | 'name' | 'parentId'>;

export type TDraftEntity = TDraftShape | TDraftLine | TDraftPath | TDraftPolygon | TDraftStar | TDraftMedia | TDraftText;

export type TBoxSceneNode =
  TEllipseNode | TFrameNode | TGroupNode | TMediaNode | TPathNode | TPolygonNode | TRectangleNode | TSectionNode | TStarNode | TTextNode;

export type TSceneNode = TBoxSceneNode | TLineNode | TVectorNode;

export type TNewSceneNode =
  | Omit<TEllipseNode, 'id'>
  | Omit<TFrameNode, 'id'>
  | Omit<TGroupNode, 'id'>
  | Omit<TMediaNode, 'id'>
  | Omit<TPathNode, 'id'>
  | Omit<TPolygonNode, 'id'>
  | Omit<TRectangleNode, 'id'>
  | Omit<TSectionNode, 'id'>
  | Omit<TStarNode, 'id'>
  | Omit<TTextNode, 'id'>
  | Omit<TLineNode, 'id'>
  | Omit<TVectorNode, 'id'>;

export type TSceneNodeChanges =
  | Partial<TEllipseNode>
  | Partial<TFrameNode>
  | Partial<TGroupNode>
  | Partial<TMediaNode>
  | Partial<TPathNode>
  | Partial<TPolygonNode>
  | Partial<TRectangleNode>
  | Partial<TSectionNode>
  | Partial<TStarNode>
  | Partial<TTextNode>
  | Partial<TLineNode>
  | Partial<TVectorNode>;

export type TViewport = {
  x: number;
  y: number;
  zoom: number;
};
