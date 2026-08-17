import { RefObject } from 'react';

// others
import { POLYGON_MAX_SIDES, POLYGON_MIN_SIDES } from '../../../../constants';

// store
import { selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TPolygonVertexCountDragState } from '../../types';
import { TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getUnrotatedQueryPoint } from '../../../../utils/getUnrotatedQueryPoint';
import { getVertexCountFromLocalPoint } from 'utils/canvas/vertexCount/getVertexCountFromLocalPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continuePolygonVertexCountDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  polygonVertexCountDragRef: RefObject<TPolygonVertexCountDragState | null>,
): void => {
  const dragState = polygonVertexCountDragRef.current;

  if (dragState) {
    const { bounds, flipX, flipY, nodeId, rotation } = dragState;
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const unrotatedPoint = getUnrotatedQueryPoint(rawPoint, bounds, rotation);
    const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const point = flipPoint(unrotatedPoint, center, flipX, flipY);
    const sides = getVertexCountFromLocalPoint(point, center, POLYGON_MIN_SIDES, POLYGON_MAX_SIDES);

    dispatch(updateNode({ changes: { sides }, id: nodeId }));
  }
};
