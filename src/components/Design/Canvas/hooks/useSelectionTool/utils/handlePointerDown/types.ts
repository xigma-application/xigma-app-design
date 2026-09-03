// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

export type TArmContext = {
  activeTool: ToolName;
  canvas: HTMLCanvasElement;
  canvasRefs: TCanvasRefs;
  currentSelection: string[];
  dispatch: AppDispatch;
  event: PointerEvent;
  hit: TSceneNode | null;
  orderedNodes: TSceneNode[];
  point: TPoint;
  selectedNodes: TSceneNode[];
  selectionRefs: TSelectionToolRefs;
  setClassName: (className: string | null) => void;
  smartSelectionNodes: TSceneNode[];
  viewport: TViewport;
};
