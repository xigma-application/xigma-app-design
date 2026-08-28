// types
import { TCanvasRefs, TVectorHandleHover, TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorPendingClickAction } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getVectorDraggedFillFaces } from './getVectorDraggedFillFaces';
import { getVectorMultiSelectOrigins } from './getVectorMultiSelectOrigins';

export const armVectorMultiDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  point: TPoint,
  pendingClickAction: TVectorPendingClickAction | null = null,
  box: TVectorMultiSelectBox | null = null,
): void => {
  const { handleOrigins, vertexOrigins } = getVectorMultiSelectOrigins(nodes, vectorEditingNodeIds, selectedVertexIds, selectedHandles);

  canvasRefs.vectorMultiSelect.vectorMultiDragRef.current = {
    boxOrigin: box?.bounds ?? null,
    dispatchThrottle: { frameId: null, run: null },
    handleOrigins,
    hasMoved: false,
    pendingClickAction,
    pointerStart: point,
    vertexOrigins,
  };
  canvasRefs.vectorSnapshots.draggedVectorFillFacesRef.current = getVectorDraggedFillFaces(
    nodes,
    vectorEditingNodeIds,
    Object.keys(vertexOrigins),
  );
  canvas.setPointerCapture(event.pointerId);
};
