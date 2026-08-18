import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types

// utils
import { getCornerRadiusFromPoint } from 'utils/canvas/cornerRadius/getCornerRadiusFromPoint';
import { getMaxCornerRadius } from 'utils/canvas/cornerRadius/getMaxCornerRadius';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getUnrotatedQueryPoint } from '../../../../utils/getUnrotatedQueryPoint';
import { resolveCornerFromDirection } from 'utils/canvas/cornerRadius/resolveCornerFromDirection';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { TCornerRadiusDragState } from 'types/design/canvas/types';

export const continueCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  cornerRadiusDragRef: RefObject<TCornerRadiusDragState | null>,
): void => {
  const cornerRadiusDragState = cornerRadiusDragRef.current;

  if (cornerRadiusDragState) {
    const { bounds, candidates, corner, nodeId, pointerStart, rotation } = cornerRadiusDragState;

    cornerRadiusDragState.hasMoved = true;
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const point = getUnrotatedQueryPoint(rawPoint, bounds, rotation);
    const startPoint = getUnrotatedQueryPoint(pointerStart, bounds, rotation);
    const resolvedCorner = corner ?? resolveCornerFromDirection(candidates, { x: point.x - startPoint.x, y: point.y - startPoint.y });

    if (resolvedCorner) {
      cornerRadiusDragState.corner = resolvedCorner;

      const radius = getCornerRadiusFromPoint(point, bounds, resolvedCorner);
      const roundedRadius = Math.min(Math.round(radius), getMaxCornerRadius(bounds));

      dispatch(updateNode({ changes: { cornerRadius: roundedRadius }, id: nodeId }));
    }
  }
};
