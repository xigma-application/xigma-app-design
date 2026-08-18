import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getCornerRadiusHandleSetbackMultiplier } from 'utils/canvas/cornerRadius/getCornerRadiusHandleSetbackMultiplier';
import { getMaxPolygonCornerRadius } from 'utils/canvas/cornerRadius/polygon/getMaxPolygonCornerRadius';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getPolygonPoints } from 'utils/canvas/shapes/getPolygonPoints';
import { getUnrotatedQueryPoint } from '../../../../utils/getUnrotatedQueryPoint';
import { getVertexAngles } from 'utils/math/getVertexAngles';
import { normalizeVector } from 'utils/math/normalizeVector';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { TPolygonCornerRadiusDragState } from 'types/design/canvas/types';

export const continuePolygonCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  polygonCornerRadiusDragRef: RefObject<TPolygonCornerRadiusDragState | null>,
): void => {
  const dragState = polygonCornerRadiusDragRef.current;

  if (dragState) {
    const { bounds, flipX, flipY, nodeId, rotation, sides } = dragState;

    dragState.hasMoved = true;
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const unrotatedPoint = getUnrotatedQueryPoint(rawPoint, bounds, rotation);
    const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const point = flipPoint(unrotatedPoint, center, flipX, flipY);
    const vertices = getPolygonPoints(bounds, sides);
    const [topVertex] = vertices;
    const towardCenter = normalizeVector({ x: center.x - topVertex.x, y: center.y - topVertex.y });
    const setbackMultiplier = getCornerRadiusHandleSetbackMultiplier(getVertexAngles(vertices)[0]);
    const projectedSetback = (point.x - topVertex.x) * towardCenter.x + (point.y - topVertex.y) * towardCenter.y;
    const projectedRadius = projectedSetback / setbackMultiplier;
    const maxRadius = getMaxPolygonCornerRadius(bounds, sides);
    const clampedRadius = Math.min(Math.max(projectedRadius, 0), maxRadius);
    const roundedRadius = Math.min(Math.round(clampedRadius), maxRadius);

    dispatch(updateNode({ changes: { cornerRadius: roundedRadius }, id: nodeId }));
  }
};
