// types
import {
  AlignTextBaseline,
  AlignmentHorizontal,
  AlignmentLayout,
  AlignmentVertical,
  AutoSpacing,
  BlendMode,
  CanvasStacking,
  EffectBlurType,
  EffectNoiseType,
  EffectType,
  GapMode,
  InsideStroke,
  LayoutGuideColumnsAlign,
  LayoutGuideRowsAlign,
  LayoutGuideType,
  LayoutMode,
  LayoutVersion,
  NodeType,
  PathType,
  SizingMode,
  StrokeAlign,
  StrokeBrushDirection,
  StrokeDashCap,
  StrokeJoin,
  StrokeMode,
  StrokeStyle,
  StrokeProfile,
  StrokeSides,
} from './enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TGuide } from 'types/design/guides/types';
import { TPaint } from 'types/design/paint/types';

export type TEffect = {
  blendMode?: BlendMode;
  blur: number;
  blurType?: EffectBlurType;
  clipToShape?: boolean;
  color: string;
  density?: number;
  depth?: number;
  dispersion?: number;
  end?: TPoint;
  frost?: number;
  lightAngle?: number;
  lightIntensity?: number;
  noiseSize?: number;
  noiseType?: EffectNoiseType;
  opacity: number;
  radius?: number;
  refraction?: number;
  secondaryColor?: string;
  secondaryOpacity?: number;
  splay?: number;
  spread: number;
  start?: TPoint;
  startBlur?: number;
  type: EffectType;
  visible?: boolean;
  x: number;
  y: number;
};

export type TLayoutGuide = {
  color: string;
  columnsAlign?: LayoutGuideColumnsAlign;
  count?: number;
  gutter?: number;
  height?: number;
  margin?: number;
  opacity: number;
  rowsAlign?: LayoutGuideRowsAlign;
  size?: number;
  type: LayoutGuideType;
  visible?: boolean;
  width?: number;
};

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

export type TNodeAlignment = {
  horizontal?: AlignmentHorizontal;
  vertical?: AlignmentVertical;
};

export type TGridTrackSize = { mode: SizingMode; value?: number };

export type TBaseNode = {
  alignment?: TNodeAlignment;
  blendMode?: BlendMode;
  gridChildHorizontalAlign?: AlignmentHorizontal;
  gridChildVerticalAlign?: AlignmentVertical;
  gridColumnAnchorIndex?: number;
  gridColumnSpan?: number;
  gridRowAnchorIndex?: number;
  gridRowSpan?: number;
  height: number;
  heightSizingMode?: SizingMode;
  hidden?: boolean;
  id: string;
  ignoreAutoLayout?: boolean;
  locked?: boolean;
  lockedAspectRatio?: boolean;
  maxHeight?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  name: string;
  opacity?: number;
  parentId: string | null;
  rotation: number;
  width: number;
  widthSizingMode?: SizingMode;
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
  strokeAlign?: StrokeAlign;
  strokeColor?: string;
  strokeDash?: number;
  strokeDashCap?: StrokeDashCap;
  strokeDashes?: number[];
  strokeGap?: number;
  strokeWidth?: number;
  type: NodeType.ellipse;
};

export type TFrameNode = TBaseNode & {
  alignTextBaseline?: AlignTextBaseline;
  autoSpacing?: AutoSpacing;
  canvasStacking?: CanvasStacking;
  childIds: string[];
  clipContent: boolean;
  cornerRadius?: number;
  cornerRadiusBottomLeft?: number;
  cornerRadiusBottomRight?: number;
  cornerRadiusTopLeft?: number;
  cornerRadiusTopRight?: number;
  cornerSmoothing?: number;
  effects?: TEffect[];
  fills: TPaint[];
  gridAutoPlacement?: boolean;
  gridColumnCount?: number;
  gridColumnSizes?: TGridTrackSize[];
  gridRowCount?: number;
  gridRowSizes?: TGridTrackSize[];
  guides?: TGuide[];
  horizontalGap?: number;
  horizontalGapMode?: GapMode;
  insideStroke?: InsideStroke;
  layoutAlignment?: AlignmentLayout;
  layoutGuides?: TLayoutGuide[];
  layoutMode?: LayoutMode;
  layoutVersion?: LayoutVersion;
  layoutWrap?: boolean;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  strokeAlign?: StrokeAlign;
  strokeColor?: string;
  strokeBrush?: string;
  strokeBrushAngularJitter?: number;
  strokeBrushDirection?: StrokeBrushDirection;
  strokeBrushGap?: number;
  strokeBrushRotation?: number;
  strokeBrushSizeJitter?: number;
  strokeBrushWiggle?: number;
  strokeDash?: number;
  strokeDashCap?: StrokeDashCap;
  strokeDashes?: number[];
  strokeDynamicFrequency?: number;
  strokeDynamicSmoothen?: number;
  strokeDynamicWiggle?: number;
  strokeGap?: number;
  strokeWidth?: number;
  strokeBottomWidth?: number;
  strokeJoin?: StrokeJoin;
  strokeLeftWidth?: number;
  strokeMiterAngle?: number;
  strokeMode?: StrokeMode;
  strokeProfile?: StrokeProfile;
  strokeProfileFlipped?: boolean;
  strokeRightWidth?: number;
  strokeSides?: StrokeSides;
  strokeStyle?: StrokeStyle;
  strokeTopWidth?: number;
  strokes?: TPaint[];
  type: NodeType.frame;
  verticalGap?: number;
  verticalGapMode?: GapMode;
};

export type TGroupNode = TBaseNode & {
  childIds: string[];
  type: NodeType.group;
};

export type TMaskNode = TBaseNode & {
  childIds: string[];
  type: NodeType.mask;
};

export type TGroupLikeNode = TGroupNode | TMaskNode;

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
  cornerRadiusBottomLeft?: number;
  cornerRadiusBottomRight?: number;
  cornerRadiusTopLeft?: number;
  cornerRadiusTopRight?: number;
  cornerSmoothing?: number;
  effects?: TEffect[];
  fills: TPaint[];
  strokeAlign?: StrokeAlign;
  strokeColor?: string;
  strokeBrush?: string;
  strokeBrushAngularJitter?: number;
  strokeBrushDirection?: StrokeBrushDirection;
  strokeBrushGap?: number;
  strokeBrushRotation?: number;
  strokeBrushSizeJitter?: number;
  strokeBrushWiggle?: number;
  strokeDash?: number;
  strokeDashCap?: StrokeDashCap;
  strokeDashes?: number[];
  strokeDynamicFrequency?: number;
  strokeDynamicSmoothen?: number;
  strokeDynamicWiggle?: number;
  strokeGap?: number;
  strokeWidth?: number;
  strokeBottomWidth?: number;
  strokeJoin?: StrokeJoin;
  strokeLeftWidth?: number;
  strokeMiterAngle?: number;
  strokeMode?: StrokeMode;
  strokeProfile?: StrokeProfile;
  strokeProfileFlipped?: boolean;
  strokeRightWidth?: number;
  strokeSides?: StrokeSides;
  strokeStyle?: StrokeStyle;
  strokeTopWidth?: number;
  strokes?: TPaint[];
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
  strokeAlign?: StrokeAlign;
  strokeColor?: string;
  strokeDash?: number;
  strokeDashCap?: StrokeDashCap;
  strokeDashes?: number[];
  strokeGap?: number;
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
  | TEllipseNode
  | TFrameNode
  | TGroupNode
  | TMaskNode
  | TMediaNode
  | TPathNode
  | TPolygonNode
  | TRectangleNode
  | TSectionNode
  | TStarNode
  | TTextNode;

export type TSceneNode = TBoxSceneNode | TLineNode | TVectorNode;

export type TNewSceneNode =
  | Omit<TEllipseNode, 'id'>
  | Omit<TFrameNode, 'id'>
  | Omit<TGroupNode, 'id'>
  | Omit<TMaskNode, 'id'>
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
  | Partial<TMaskNode>
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
