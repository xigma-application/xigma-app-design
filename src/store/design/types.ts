// types
import { ToolName } from 'types/design/enums';
import { TAutoLayoutPaddingEditState } from 'utils/canvas/autoLayoutPadding/types';
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TComment, TSceneNode, TSceneNodeChanges, TViewport } from 'types/design/types';
import {
  TGridSectionHighlight,
  TGridTrackModeMenuRequest,
  TGridTrackSelection,
  TGridTrackValueEditRequest,
} from 'types/design/canvas/types';
import { TGuide, TGuideAxis } from 'types/design/guides/types';
import { TPaint, TPaintProperty, TSolidPaint } from 'types/design/paint/types';

export type TDesignPage = {
  backgroundPaint: TSolidPaint | null;
  comments: Record<string, TComment>;
  guides: TGuide[];
  id: string;
  name: string;
  nodes: Record<string, TSceneNode>;
  paint: TPaint;
  rootOrder: string[];
  selectedFillIndices?: number[];
  selectedStrokeIndices?: number[];
  selectedIds: string[];
  viewport: TViewport;
};

export type TMaskConnectorRole = 'mask' | 'masked-continue' | 'masked-start';

export type TMaskConnectorLine = {
  depthOffset: number;
  role: TMaskConnectorRole;
};

export type TMaskConnectorInfo = TMaskConnectorLine[];

export type TPropertyPanelKind = TPaintProperty | 'effects' | 'layoutGuides';

export type TOpenPropertyPanel = { index: number; nodeId: string; property: TPropertyPanelKind };

export type TGradientEditorState = { nodeId: string; paintIndex: number; property?: TPaintProperty; selectedStopIndex: number | null };

export type TImageEditorMode = 'crop' | 'position' | 'tile';

export type TImageEditorTarget = 'frame' | 'image';

export type TCropCancelSnapshot = {
  cornerRadius?: number;
  fills: TPaint[];
  height: number;
  rotation: number;
  strokes?: TPaint[];
  width: number;
  x: number;
  y: number;
};

export type TImageEditorState = {
  cropCancelSnapshot?: TCropCancelSnapshot;
  mode: TImageEditorMode;
  nodeId: string;
  paintIndex: number;
  property?: TPaintProperty;
  selectedTarget?: TImageEditorTarget;
};

export type TImageFillPickerFocus = { nodeId: string; paintIndex: number; property?: TPaintProperty };

export type TPatternSourcePickTarget = { nodeIds: string[]; paintIndex: number; property?: TPaintProperty };

export type TResolvedTheme = 'dark' | 'light';

export type TPreferences = {
  areAdditionalLabelsVisible: boolean;
  areFrameOutlinesVisible: boolean;
  areLayoutGuidesVisible: boolean;
  areMaskOutlinesVisible: boolean;
  areRulersVisible: boolean;
  resolvedTheme: TResolvedTheme;
};

export type TRevealedMinMax = {
  maxHeight: boolean;
  maxWidth: boolean;
  minHeight: boolean;
  minWidth: boolean;
};

export type TDimensionHintField = 'height' | 'maxHeight' | 'maxWidth' | 'minHeight' | 'minWidth' | 'width';

export type TDesignState = {
  activePageId: string;
  activeTool: ToolName;
  commentDraftPosition: TPoint | null;
  designHintLabelKey: string | null;
  editingAutoLayoutPadding?: TAutoLayoutPaddingEditState | null;
  editingNodeId: string | null;
  editingSelectionChangedAt: number;
  editingSelectionEnd: number;
  editingSelectionStart: number;
  editingTextBox: TEditingTextBox | null;
  editingTextContent: string;
  gradientEditor: TGradientEditorState | null;
  gridSectionHighlight?: TGridSectionHighlight | null;
  gridTrackModeMenuRequest?: TGridTrackModeMenuRequest | null;
  gridTrackSelection?: TGridTrackSelection | null;
  gridTrackValueEditRequest?: TGridTrackValueEditRequest | null;
  hoveredDimensionField?: TDimensionHintField | null;
  imageEditor: TImageEditorState | null;
  imageFillPickerFocus?: TImageFillPickerFocus | null;
  isActionsPanelOpen: boolean;
  isExporting?: boolean;
  isGridSettingsPanelOpen?: boolean;
  isMediaToolArmed: boolean;
  isPatternSourcePicking: boolean;
  isUiHidden: boolean;
  isUiMinimized: boolean;
  lastFrameTool: ToolName;
  lastMoreTool: ToolName | null;
  lastMouseTool: ToolName;
  lastPenTool: ToolName;
  lastShapeTool: ToolName;
  lastTextTool: ToolName;
  openPropertyPanel?: TOpenPropertyPanel | null;
  pages: Record<string, TDesignPage>;
  panelGridTrackSelection?: TGridTrackSelection | null;
  patternSourcePickTarget: TPatternSourcePickTarget | null;
  penActiveVertexId: string | null;
  preferences: TPreferences;
  revealedMinMax: TRevealedMinMax;
  vectorEditingNodeIds: string[];
};

export type TDesignSnapshot = {
  activePageId: string;
  gridTrackSelection?: TGridTrackSelection | null;
  pages: Record<string, TDesignPage>;
  panelGridTrackSelection?: TGridTrackSelection | null;
};

export type TUpdateNodesPayload = { changes: TSceneNodeChanges; id: string }[];

export type TReorderPayload = {
  fromIndex: number;
  toIndex: number;
};

export type TMoveNodesPayload = {
  nodeIds: string[];
  targetIndex: number;
  targetParentId: string | null;
};

export type TMoveNodesToPagePayload = {
  nodeIds: string[];
  targetPageId: string;
};

export type TAddNodesPayload = {
  nodes: TSceneNode[];
  rootIds: string[];
};

export type TStartTextEditPayload = {
  box: TEditingTextBox;
  content?: string;
  id?: string | null;
};

export type TTextEditSelection = {
  end: number;
  start: number;
};

export type TAddGuidePayload = {
  axis: TGuideAxis;
  frameId: string | null;
  id: string;
  position: number;
};

export type TUpdateGuidePayload = {
  frameId: string | null;
  id: string;
  position: number;
};

export type TDeleteGuidePayload = {
  frameId: string | null;
  id: string;
};

export type TDeleteAllGuidesPayload = {
  axis: TGuideAxis;
};
