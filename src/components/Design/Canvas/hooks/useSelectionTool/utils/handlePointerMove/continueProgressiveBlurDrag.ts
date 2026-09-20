import { RefObject } from 'react';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs, TProgressiveBlurDragState } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

// utils
import { getGradientMoveSnapGuide } from '../../../../utils/getGradientMoveSnapGuide';
import { getGradientMoveSnapPoint } from '../../../../utils/getGradientMoveSnapPoint';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { isProgressiveLayerBlur } from 'utils/design/effects/isProgressiveLayerBlur';
import { rotatePoint } from 'utils/math/rotatePoint';
import { screenToWorld } from 'utils/transform/screenToWorld';
import { toNormalizedGradientPoint } from '../../../../utils/toNormalizedGradientPoint';

export const continueProgressiveBlurDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragRef: RefObject<TProgressiveBlurDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  const dragState = dragRef.current;

  if (dragState) {
    const { effectIndex, endpoint, nodeId } = dragState;
    const state = store.getState();
    const node = selectNodes(state)[nodeId];
    const effect = node && 'effects' in node ? node.effects?.[effectIndex] : undefined;

    if (node && 'effects' in node && node.effects && effect && isProgressiveLayerBlur(effect)) {
      const bounds = { height: node.height, width: node.width, x: node.x, y: node.y };
      const boundsCenter: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
      const viewport = selectViewport(state);
      const worldPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
      const localPoint = node.rotation === 0 ? worldPoint : rotatePoint(worldPoint, boundsCenter, -node.rotation);
      const { point, snappedX, snappedY } = getGradientMoveSnapPoint(toNormalizedGradientPoint(localPoint, bounds), bounds, viewport.zoom);
      const effects = node.effects.map((current, index) => (index === effectIndex ? { ...current, [endpoint]: point } : current));

      canvasRefs.transform.alignmentGuideRef.current = getGradientMoveSnapGuide(point, bounds, node.rotation, snappedX, snappedY);
      dispatch(updateNode({ changes: { effects }, id: nodeId }));
    }
  }
};
