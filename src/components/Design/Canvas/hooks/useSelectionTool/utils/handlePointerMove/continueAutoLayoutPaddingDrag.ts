import { RefObject } from 'react';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TAutoLayoutPaddingDragState } from 'types/design/canvas/types';

// utils
import { getAutoLayoutPaddingCursorAngle } from 'utils/canvas/autoLayoutPadding/getAutoLayoutPaddingCursorAngle';
import { getAutoLayoutPaddingDragValue } from 'utils/canvas/autoLayoutPadding/getAutoLayoutPaddingDragValue';
import { getAutoLayoutPaddingKey } from 'utils/canvas/autoLayoutPadding/getAutoLayoutPaddingKey';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { getUnrotatedQueryPoint } from 'components/Design/Canvas/utils/getUnrotatedQueryPoint';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const continueAutoLayoutPaddingDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null>,
): void => {
  const dragState = paddingDragRef.current;

  if (dragState) {
    const state = store.getState();
    const viewport = selectViewport(state);
    const frame = selectNodes(state)[dragState.frameId];

    if (frame && frame.type === NodeType.frame) {
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const localPoint = getUnrotatedQueryPoint(point, frame, frame.rotation);
      const nextValue = getAutoLayoutPaddingDragValue(dragState, frame, localPoint);
      const cursorAngle = getAutoLayoutPaddingCursorAngle(dragState.side, frame.rotation, false);

      dragState.point = point;
      canvas.style.cursor = getRotatedCursorUrl('gap', cursorAngle) ?? canvas.style.cursor;
      dispatch(updateNode({ changes: { [getAutoLayoutPaddingKey(dragState.side)]: nextValue }, id: frame.id }));
    }
  }
};
