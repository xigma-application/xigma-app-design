import { RefObject } from 'react';

// others
import { ELLIPSE_ARC_MAX_RATIO, ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseArcRatioDragState } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getEllipseArcMajorArc } from 'utils/canvas/ellipseArc/getEllipseArcMajorArc';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getUnrotatedQueryPoint } from '../../../../utils/getUnrotatedQueryPoint';
import { isAngleWithinArc } from 'utils/canvas/ellipseArc/isAngleWithinArc';
import { screenToWorld } from 'utils/transform/screenToWorld';

const normalizeAngle = (angle: number): number => ((angle % 360) + 360) % 360;

export const continueEllipseArcRatioDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  ellipseArcRatioDragRef: RefObject<TEllipseArcRatioDragState | null>,
): void => {
  const dragState = ellipseArcRatioDragRef.current;

  if (dragState) {
    const { bounds, flipX, flipY, nodeId, rotation } = dragState;
    const state = store.getState();
    const node = selectNodes(state)[nodeId];
    const isEllipse = node.type === NodeType.ellipse;
    const arcStartAngle = (isEllipse ? node.arcStartAngle : undefined) ?? ELLIPSE_DEFAULT_ARC_ANGLE;
    const arcEndAngle = (isEllipse ? node.arcEndAngle : undefined) ?? ELLIPSE_DEFAULT_ARC_ANGLE;
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
    const unrotatedPoint = getUnrotatedQueryPoint(rawPoint, bounds, rotation);
    const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const point = flipPoint(unrotatedPoint, center, flipX, flipY);
    const normalizedX = (point.x - center.x) / (bounds.width / 2);
    const normalizedY = (point.y - center.y) / (bounds.height / 2);
    const rawRatio = Math.hypot(normalizedX, normalizedY);
    const clampedRatio = Math.min(Math.max(rawRatio, 0), ELLIPSE_ARC_MAX_RATIO);
    const arcRatio = Math.round(clampedRatio * 100) / 100;
    const followScale = rawRatio === 0 ? 0 : clampedRatio / rawRatio;
    const draggedLocalPosition: TPoint = {
      x: center.x + normalizedX * followScale * (bounds.width / 2),
      y: center.y + normalizedY * followScale * (bounds.height / 2),
    };
    const mathAngle = Math.atan2(point.y - center.y, point.x - center.x);
    const compassAngle = normalizeAngle((mathAngle * 180) / Math.PI + 90);
    const { majorStart, majorSweep } = getEllipseArcMajorArc(arcStartAngle, arcEndAngle);
    const arcRatioInverted = !isAngleWithinArc(compassAngle, majorStart, majorSweep);

    dragState.draggedHandlePosition = flipPoint(draggedLocalPosition, center, flipX, flipY);

    dispatch(updateNode({ changes: { arcRatio, arcRatioInverted }, id: nodeId }));
  }
};
