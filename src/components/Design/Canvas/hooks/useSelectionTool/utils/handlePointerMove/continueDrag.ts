import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TDragState, TNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNodeChanges } from 'types/design/types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { translateVectorVertices } from '../../../../utils/translateVectorVertices';

const getOriginChanges = (origin: TNodeOrigin, deltaX: number, deltaY: number): TSceneNodeChanges => {
  switch (true) {
    case 'x1' in origin:
      return {
        x1: Math.round(origin.x1 + deltaX),
        x2: Math.round(origin.x2 + deltaX),
        y1: Math.round(origin.y1 + deltaY),
        y2: Math.round(origin.y2 + deltaY),
      };
    case 'vertices' in origin:
      return { vertices: translateVectorVertices(origin.vertices, deltaX, deltaY) };
    default:
      return { x: Math.round(origin.x + deltaX), y: Math.round(origin.y + deltaY) };
  }
};

export const continueDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragStateRef: RefObject<TDragState | null>,
): void => {
  const dragState = dragStateRef.current;

  if (dragState) {
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const deltaX = point.x - dragState.pointerStart.x;
    const deltaY = point.y - dragState.pointerStart.y;

    dragState.hasMoved = true;
    Object.entries(dragState.nodeOrigins).forEach(([id, origin]) => {
      dispatch(updateNode({ changes: getOriginChanges(origin, deltaX, deltaY), id }));
    });
  }
};
