import { RefObject } from 'react';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TAutoLayoutGapDragState } from 'types/design/canvas/types';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { getUnrotatedQueryPoint } from 'components/Design/Canvas/utils/getUnrotatedQueryPoint';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const continueAutoLayoutGapDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  gapDragRef: RefObject<TAutoLayoutGapDragState | null>,
): void => {
  const dragState = gapDragRef.current;

  if (dragState) {
    const state = store.getState();
    const viewport = selectViewport(state);
    const frame = selectNodes(state)[dragState.frameId];

    if (frame && frame.type === NodeType.frame) {
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const localPoint = getUnrotatedQueryPoint(point, frame, frame.rotation);
      const localPointerStart = getUnrotatedQueryPoint(dragState.pointerStart, frame, frame.rotation);
      const delta = dragState.axis === 'horizontal' ? localPoint.x - localPointerStart.x : localPoint.y - localPointerStart.y;
      const nextGapValue = Math.max(0, dragState.originalGapValue + delta);
      const cursorAngle = dragState.axis === 'vertical' ? frame.rotation : frame.rotation + 90;

      dragState.point = point;
      canvas.style.cursor = getRotatedCursorUrl('gap', cursorAngle) ?? canvas.style.cursor;
      dispatch(
        updateNode({ changes: { [dragState.axis === 'horizontal' ? 'horizontalGap' : 'verticalGap']: nextGapValue }, id: frame.id }),
      );
    }
  }
};
