import { RefObject } from 'react';

// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectActiveTool, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorVertexAtPointAcrossOpenNodes } from '../../../../utils/getVectorVertexAtPointAcrossOpenNodes';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const resolveVectorVertexHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  hoveredVectorVertexIdRef: RefObject<string | null>,
): void => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (vectorEditingNodeIds.length > 0 && selectActiveTool(state) !== ToolName.paint) {
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const hit = getVectorVertexAtPointAcrossOpenNodes(
      point,
      vectorEditingNodeIds,
      state.design.pages[state.design.activePageId].nodes,
      VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
    );

    hoveredVectorVertexIdRef.current = hit?.vertexId ?? null;
  } else {
    hoveredVectorVertexIdRef.current = null;
  }
};
