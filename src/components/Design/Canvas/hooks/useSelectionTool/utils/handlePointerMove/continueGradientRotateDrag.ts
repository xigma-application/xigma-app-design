import { RefObject } from 'react';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientRotateDragState } from 'types/design/canvas/types';

// utils
import { getGradientAngleFromPoint } from '../../../../utils/getGradientAngleFromPoint';
import { getGradientEndpointsAtAngle } from '../../../../utils/getGradientEndpointsAtAngle';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { screenToWorld } from 'utils/transform/screenToWorld';

const toNormalizedGradientPoint = (point: TPoint, bounds: TDraftRect): TPoint => ({
  x: (point.x - bounds.x) / bounds.width,
  y: (point.y - bounds.y) / bounds.height,
});

export const continueGradientRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  gradientRotateDragRef: RefObject<TGradientRotateDragState | null>,
): void => {
  const dragState = gradientRotateDragRef.current;

  if (dragState) {
    const { draggedEndpoint, nodeId, paintIndex } = dragState;
    const state = store.getState();
    const node = selectNodes(state)[nodeId];

    if (isAppearanceNode(node)) {
      const paint = node.fills[paintIndex];

      if (paint?.type === 'gradient-linear') {
        const bounds = getNodeBounds(node);
        const worldPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
        const angle = getGradientAngleFromPoint(worldPoint, bounds, node.rotation);
        const localPoints = getGradientEndpointsAtAngle(bounds, angle);
        const newLocalStart = draggedEndpoint === 'start' ? localPoints.start : localPoints.end;
        const newLocalEnd = draggedEndpoint === 'start' ? localPoints.end : localPoints.start;
        const start = toNormalizedGradientPoint(newLocalStart, bounds);
        const end = toNormalizedGradientPoint(newLocalEnd, bounds);
        const fills = node.fills.map((fill, index) => (index === paintIndex ? { ...paint, end, start } : fill));

        dragState.pointerPosition = worldPoint;
        dispatch(updateNode({ changes: { fills }, id: nodeId }));
      }
    }
  }
};
