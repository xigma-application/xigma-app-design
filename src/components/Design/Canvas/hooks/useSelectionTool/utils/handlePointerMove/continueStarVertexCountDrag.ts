import { RefObject } from 'react';

// others
import { STAR_MAX_POINTS, STAR_MIN_POINTS } from '../../../../constants';

// store
import { selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TStarVertexCountDragState } from '../../types';
import { TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getUnrotatedQueryPoint } from '../../../../utils/getUnrotatedQueryPoint';
import { getVertexCountFromLocalPoint } from 'utils/canvas/vertexCount/getVertexCountFromLocalPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueStarVertexCountDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  starVertexCountDragRef: RefObject<TStarVertexCountDragState | null>,
): void => {
  const dragState = starVertexCountDragRef.current;

  if (dragState) {
    const { bounds, flipX, flipY, nodeId, rotation } = dragState;
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const unrotatedPoint = getUnrotatedQueryPoint(rawPoint, bounds, rotation);
    const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const point = flipPoint(unrotatedPoint, center, flipX, flipY);
    const points = getVertexCountFromLocalPoint(point, center, STAR_MIN_POINTS, STAR_MAX_POINTS);

    dispatch(updateNode({ changes: { points }, id: nodeId }));
  }
};
