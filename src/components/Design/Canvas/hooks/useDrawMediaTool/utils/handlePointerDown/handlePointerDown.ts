import { RefObject } from 'react';

// store
import { selectNodes, selectRenderOrderedNodes, selectRootOrder, selectViewport } from 'store/design/selectors';
import { AppStore } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TArmedMedia } from '../loadArmedMedia';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/types';
import { TPoint } from 'types/canvas';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { resolveNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/resolveNewNodeDropTarget';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  appStore: AppStore,
  canvasRefs: TCanvasRefs,
  armedRef: RefObject<TArmedMedia | null>,
  startRef: RefObject<TPoint | null>,
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
): void => {
  if (event.button === MouseButton.primary && armedRef.current) {
    const state = appStore.getState();
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));

    startRef.current = point;
    dropTargetRef.current = resolveNewNodeDropTarget(
      canvasRefs,
      point,
      selectRenderOrderedNodes(state),
      selectNodes(state),
      selectRootOrder(state),
    );
    canvas.setPointerCapture(event.pointerId);
  }
};
