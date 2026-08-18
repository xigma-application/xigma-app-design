import { RefObject } from 'react';

// others
import { STAR_MAX_RATIO, STAR_MIN_RATIO } from '../../../../constants';

// store
import { selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TStarRatioDragState } from 'types/design/selectionTool/types';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getRatioFromLocalPoint } from 'utils/canvas/ratio/getRatioFromLocalPoint';
import { getStarPoints } from 'utils/canvas/shapes/getStarPoints';
import { getUnrotatedQueryPoint } from '../../../../utils/getUnrotatedQueryPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueStarRatioDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  starRatioDragRef: RefObject<TStarRatioDragState | null>,
): void => {
  const dragState = starRatioDragRef.current;

  if (dragState) {
    const { bounds, flipX, flipY, nodeId, points, rotation } = dragState;
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const unrotatedPoint = getUnrotatedQueryPoint(rawPoint, bounds, rotation);
    const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const point = flipPoint(unrotatedPoint, center, flipX, flipY);
    const anchor = getStarPoints(bounds, points, 1)[1];
    const ratio = getRatioFromLocalPoint(point, center, anchor, STAR_MIN_RATIO, STAR_MAX_RATIO);

    dispatch(updateNode({ changes: { ratio }, id: nodeId }));
  }
};
