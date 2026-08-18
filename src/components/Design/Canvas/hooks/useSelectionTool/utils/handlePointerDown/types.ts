// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

export type TArmContext = {
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
  viewport: TViewport;
};
