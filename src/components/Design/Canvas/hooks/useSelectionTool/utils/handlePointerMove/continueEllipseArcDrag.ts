import { RefObject } from 'react';

// others
import { ELLIPSE_ARC_LAP_SNAP_DEGREES } from '../../../../constants';
import { ELLIPSE_ARC_MAX_RATIO, ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseArcDragState } from '../../types';
import { TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getUnrotatedQueryPoint } from '../../../../utils/getUnrotatedQueryPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

const normalizeAngle = (angle: number): number => ((angle % 360) + 360) % 360;

export const continueEllipseArcDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  ellipseArcDragRef: RefObject<TEllipseArcDragState | null>,
): void => {
  const dragState = ellipseArcDragRef.current;

  if (dragState) {
    const { bounds, flipX, flipY, nodeId, rotation } = dragState;
    const state = store.getState();
    const node = selectNodes(state)[nodeId];
    const isEllipse = node.type === NodeType.ellipse;
    const arcStartAngle = (isEllipse ? node.arcStartAngle : undefined) ?? ELLIPSE_DEFAULT_ARC_ANGLE;
    const currentArcEndAngle = (isEllipse ? node.arcEndAngle : undefined) ?? ELLIPSE_DEFAULT_ARC_ANGLE;
    const arcRatio = Math.min(Math.max((isEllipse ? node.arcRatio : undefined) ?? 0, 0), ELLIPSE_ARC_MAX_RATIO);
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
    const unrotatedPoint = getUnrotatedQueryPoint(rawPoint, bounds, rotation);
    const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const point = flipPoint(unrotatedPoint, center, flipX, flipY);
    const mathAngle = Math.atan2(point.y - center.y, point.x - center.x);
    const rawCompassAngle = normalizeAngle((mathAngle * 180) / Math.PI + 90);
    const rawDelta = rawCompassAngle - normalizeAngle(currentArcEndAngle);
    const shortestDelta = rawDelta > 180 ? rawDelta - 360 : rawDelta < -180 ? rawDelta + 360 : rawDelta;
    const unsnappedArcEndAngle = currentArcEndAngle + shortestDelta;
    const sweep = unsnappedArcEndAngle - arcStartAngle;
    const nearestLapSweep = Math.round(sweep / 360) * 360;
    const arcEndAngle = Math.round(
      Math.abs(sweep - nearestLapSweep) <= ELLIPSE_ARC_LAP_SNAP_DEGREES ? arcStartAngle + nearestLapSweep : unsnappedArcEndAngle,
    );
    const restMathAngle = ((arcEndAngle - 90) * Math.PI) / 180;
    const restLocalPosition: TPoint = {
      x: center.x + (bounds.width / 2) * Math.cos(restMathAngle),
      y: center.y + (bounds.height / 2) * Math.sin(restMathAngle),
    };
    const innerLocalPosition: TPoint = {
      x: center.x + (bounds.width / 2) * arcRatio * Math.cos(restMathAngle),
      y: center.y + (bounds.height / 2) * arcRatio * Math.sin(restMathAngle),
    };
    const segmentX = restLocalPosition.x - innerLocalPosition.x;
    const segmentY = restLocalPosition.y - innerLocalPosition.y;
    const segmentLengthSquared = segmentX * segmentX + segmentY * segmentY;
    const projection =
      segmentLengthSquared === 0
        ? 0
        : ((point.x - innerLocalPosition.x) * segmentX + (point.y - innerLocalPosition.y) * segmentY) / segmentLengthSquared;
    const t = Math.min(Math.max(projection, 0), 1);
    const draggedLocalPosition: TPoint = { x: innerLocalPosition.x + t * segmentX, y: innerLocalPosition.y + t * segmentY };

    dragState.draggedHandlePosition = flipPoint(draggedLocalPosition, center, flipX, flipY);

    dispatch(updateNode({ changes: { arcEndAngle }, id: nodeId }));
  }
};
