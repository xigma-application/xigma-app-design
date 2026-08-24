import { RefObject } from 'react';

// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectActiveTool, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { clearVectorSegmentHover } from './clearVectorSegmentHover';
import { getPointerPosition } from '../../../../../utils/getPointerPosition';
import { getVectorEdgeAtPointAcrossOpenNodes } from '../../../../../utils/getVectorEdgeAtPointAcrossOpenNodes';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { resolveVectorSegmentHoverInNode } from './resolveVectorSegmentHoverInNode';
import { screenToWorld } from '../../../../../utils/screenToWorld';

export const resolveVectorSegmentHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  hoveredVectorSegmentIdRef: RefObject<string | null>,
  hoveredVectorEdgeInsertPointRef: RefObject<TPoint | null>,
  setClassName: (className: string | null) => void,
): void => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  const activeTool = selectActiveTool(state);
  const isSegmentHoverBlockedByTool =
    activeTool === ToolName.paint || activeTool === ToolName.lasso || activeTool === ToolName.cut || activeTool === ToolName.variableWidth;

  if (vectorEditingNodeIds.length > 0 && !isSegmentHoverBlockedByTool) {
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const edgeHit = getVectorEdgeAtPointAcrossOpenNodes(
      point,
      vectorEditingNodeIds,
      state.design.nodes,
      VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
      VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
    );
    const node = edgeHit?.node ?? getVectorEditingNode(state.design.nodes, vectorEditingNodeIds[0]);

    if (node) {
      resolveVectorSegmentHoverInNode(canvas, event, state, node, hoveredVectorSegmentIdRef, hoveredVectorEdgeInsertPointRef, setClassName);
    }
  } else {
    clearVectorSegmentHover(event, hoveredVectorSegmentIdRef, hoveredVectorEdgeInsertPointRef);

    if (isSegmentHoverBlockedByTool) {
      setClassName(null);
    }
  }
};
