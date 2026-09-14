import { RefObject } from 'react';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs, TGradientEndpointMoveDragState } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

// utils
import { getGradientMoveSnapGuide } from '../../../../utils/getGradientMoveSnapGuide';
import { getGradientMoveSnapPoint } from '../../../../utils/getGradientMoveSnapPoint';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isLineHandleGradientPaint } from '../../../../utils/isLineHandleGradientPaint';
import { rotatePoint } from 'utils/math/rotatePoint';
import { screenToWorld } from 'utils/transform/screenToWorld';
import { toNormalizedGradientPoint } from '../../../../utils/toNormalizedGradientPoint';

export const continueGradientEndpointMoveDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  gradientEndpointMoveDragRef: RefObject<TGradientEndpointMoveDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  const dragState = gradientEndpointMoveDragRef.current;

  if (dragState) {
    const { endpoint, nodeId, paintIndex } = dragState;
    const state = store.getState();
    const node = selectNodes(state)[nodeId];

    if (isAppearanceNode(node)) {
      const paint = node.fills[paintIndex];

      if (isLineHandleGradientPaint(paint)) {
        const bounds = getNodeBounds(node);
        const boundsCenter: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
        const viewport = selectViewport(state);
        const worldPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
        const localPoint = node.rotation === 0 ? worldPoint : rotatePoint(worldPoint, boundsCenter, -node.rotation);
        const rawNormalized = toNormalizedGradientPoint(localPoint, bounds);
        const { point, snappedX, snappedY } = getGradientMoveSnapPoint(rawNormalized, bounds, viewport.zoom);
        const fills = node.fills.map((fill, index) => (index === paintIndex ? { ...paint, [endpoint]: point } : fill));

        canvasRefs.transform.alignmentGuideRef.current = getGradientMoveSnapGuide(point, bounds, node.rotation, snappedX, snappedY);
        dispatch(updateNode({ changes: { fills }, id: nodeId }));
      }
    }
  }
};
