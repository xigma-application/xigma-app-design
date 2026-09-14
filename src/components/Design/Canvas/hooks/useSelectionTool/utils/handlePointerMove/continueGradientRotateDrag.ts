import { RefObject } from 'react';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs, TGradientRotateDragState } from 'types/design/canvas/types';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getGradientAngleFromPoint } from '../../../../utils/getGradientAngleFromPoint';
import { getGradientEndpointsAroundPivot } from '../../../../utils/getGradientEndpointsAroundPivot';
import { getGradientRotateAxisGuide } from '../../../../utils/getGradientRotateAxisGuide';
import { getGradientRotateSnapAngle } from '../../../../utils/getGradientRotateSnapAngle';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getRectPerimeterPointAtAngle } from 'utils/canvas/getRectPerimeterPointAtAngle';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { screenToWorld } from 'utils/transform/screenToWorld';
import { toNormalizedGradientPoint } from '../../../../utils/toNormalizedGradientPoint';

type TGradientRotateFrame = { guidePivot: TPoint; localPoints: { end: TPoint; start: TPoint }; snap: ReturnType<typeof getGradientRotateSnapAngle> };

const getBoxModeFrame = (dragState: TGradientRotateDragState, bounds: TDraftRect, worldPoint: TPoint, rotation: number): TGradientRotateFrame => {
  const boundsCenter: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const rawDraggedAngle = getGradientAngleFromPoint(worldPoint, bounds, rotation);
  const snap = getGradientRotateSnapAngle(rawDraggedAngle);
  const draggedAngle = snap?.angle ?? rawDraggedAngle;
  const otherAngle = draggedAngle + Math.PI + dragState.angleOffset;
  const draggedLocal = getRectPerimeterPointAtAngle(bounds, draggedAngle);
  const otherLocal = getRectPerimeterPointAtAngle(bounds, otherAngle);
  const localPoints =
    dragState.draggedEndpoint === 'start'
      ? { end: otherLocal, start: draggedLocal }
      : { end: draggedLocal, start: otherLocal };

  return { guidePivot: boundsCenter, localPoints, snap };
};

const getLineModeFrame = (dragState: TGradientRotateDragState, bounds: TDraftRect, worldPoint: TPoint, rotation: number): TGradientRotateFrame => {
  const rawAngle = getGradientAngleFromPoint(worldPoint, bounds, rotation, dragState.pivot);
  const snap = getGradientRotateSnapAngle(rawAngle);
  const angle = snap?.angle ?? rawAngle;
  const localPoints = getGradientEndpointsAroundPivot(dragState.pivot, dragState.radius, angle);

  return { guidePivot: dragState.pivot, localPoints, snap };
};

const getGradientRotateFrame = (
  dragState: TGradientRotateDragState,
  bounds: TDraftRect,
  worldPoint: TPoint,
  rotation: number,
): TGradientRotateFrame =>
  dragState.mode === 'box' ? getBoxModeFrame(dragState, bounds, worldPoint, rotation) : getLineModeFrame(dragState, bounds, worldPoint, rotation);

export const continueGradientRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  gradientRotateDragRef: RefObject<TGradientRotateDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  const dragState = gradientRotateDragRef.current;

  if (dragState) {
    const { nodeId, paintIndex } = dragState;
    const state = store.getState();
    const node = selectNodes(state)[nodeId];

    if (isAppearanceNode(node)) {
      const paint = node.fills[paintIndex];

      if (paint?.type === 'gradient-linear') {
        const bounds = getNodeBounds(node);
        const worldPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
        const frame = getGradientRotateFrame(dragState, bounds, worldPoint, node.rotation);
        const start = toNormalizedGradientPoint(frame.localPoints.start, bounds);
        const end = toNormalizedGradientPoint(frame.localPoints.end, bounds);
        const fills = node.fills.map((fill, index) => (index === paintIndex ? { ...paint, end, start } : fill));

        canvasRefs.transform.alignmentGuideRef.current = frame.snap
          ? getGradientRotateAxisGuide(frame.guidePivot, bounds, node.rotation, frame.snap.snappedDegrees)
          : null;
        dragState.pointerPosition = worldPoint;
        dispatch(updateNode({ changes: { fills }, id: nodeId }));
      }
    }
  }
};
