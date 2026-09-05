import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getUnrotatedQueryPoint } from '../../../../utils/getUnrotatedQueryPoint';
import { getVertexCountFromLocalPoint } from 'utils/canvas/vertexCount/getVertexCountFromLocalPoint';
import { screenToWorld } from 'utils/transform/screenToWorld';

type TVertexCountDragState = {
  bounds: TDraftRect;
  flipX: boolean;
  flipY: boolean;
  nodeId: string;
  rotation: number;
};

export const continueVertexCountDrag = <T extends TVertexCountDragState>(
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragRef: RefObject<T | null>,
  min: number,
  max: number,
  field: 'points' | 'sides',
): void => {
  const dragState = dragRef.current;

  if (dragState) {
    const { bounds, flipX, flipY, nodeId, rotation } = dragState;
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const unrotatedPoint = getUnrotatedQueryPoint(rawPoint, bounds, rotation);
    const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const point = flipPoint(unrotatedPoint, center, flipX, flipY);
    const count = getVertexCountFromLocalPoint(point, center, min, max);
    const changes = field === 'sides' ? { sides: count } : { points: count };

    dispatch(updateNode({ changes, id: nodeId }));
  }
};
