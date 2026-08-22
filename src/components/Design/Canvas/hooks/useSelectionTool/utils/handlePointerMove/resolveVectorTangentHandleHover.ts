// others
import { VECTOR_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectActiveTool, selectPenActiveVertexId, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorHandleAtPointAcrossOpenNodes } from '../../../../utils/getVectorHandleAtPointAcrossOpenNodes';
import { getVisualSelectedVectorVertexIds } from 'utils/canvas/vectorNetwork/getVisualSelectedVectorVertexIds';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const resolveVectorTangentHandleHover = (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs): void => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  const activeTool = selectActiveTool(state);

  if (vectorEditingNodeIds.length > 0 && activeTool !== ToolName.paint && activeTool !== ToolName.lasso) {
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const visualSelectedVertexIds = getVisualSelectedVectorVertexIds(
      canvasRefs.selectedVectorVertexIdsRef.current,
      selectPenActiveVertexId(state),
    );
    const result = getVectorHandleAtPointAcrossOpenNodes(
      point,
      vectorEditingNodeIds,
      state.design.nodes,
      VECTOR_HANDLE_HIT_RADIUS_PX / viewport.zoom,
      visualSelectedVertexIds,
      canvasRefs.selectedVectorHandlesRef.current,
      canvasRefs.selectedVectorSegmentIdsRef.current,
    );

    canvasRefs.hoveredVectorHandleRef.current = result ? { end: result.hit.end, segmentId: result.hit.segmentId } : null;
  } else {
    canvasRefs.hoveredVectorHandleRef.current = null;
  }
};
