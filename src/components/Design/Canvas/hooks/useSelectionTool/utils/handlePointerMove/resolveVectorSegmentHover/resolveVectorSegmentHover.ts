import { RefObject } from 'react';

// store
import { selectActiveTool, selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { clearVectorSegmentHover } from './clearVectorSegmentHover';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { resolveVectorSegmentHoverInNode } from './resolveVectorSegmentHoverInNode';

export const resolveVectorSegmentHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  hoveredVectorSegmentIdRef: RefObject<string | null>,
  hoveredVectorEdgeInsertPointRef: RefObject<TPoint | null>,
  setClassName: (className: string | null) => void,
): void => {
  const state = store.getState();
  const node = getVectorEditingNode(state.design.nodes, selectVectorEditingNodeId(state));
  const activeTool = selectActiveTool(state);
  const isSegmentHoverBlockedByTool = activeTool === ToolName.paint || activeTool === ToolName.lasso;

  if (node && !isSegmentHoverBlockedByTool) {
    resolveVectorSegmentHoverInNode(canvas, event, state, node, hoveredVectorSegmentIdRef, hoveredVectorEdgeInsertPointRef, setClassName);
  } else {
    clearVectorSegmentHover(event, hoveredVectorSegmentIdRef, hoveredVectorEdgeInsertPointRef);

    if (isSegmentHoverBlockedByTool) {
      setClassName(null);
    }
  }
};
