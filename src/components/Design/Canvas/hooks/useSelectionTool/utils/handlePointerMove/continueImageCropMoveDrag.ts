import { RefObject } from 'react';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TImageCropMoveDragState } from 'types/design/canvas/types';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const continueImageCropMoveDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  imageCropMoveDragRef: RefObject<TImageCropMoveDragState | null>,
): void => {
  const dragState = imageCropMoveDragRef.current;

  if (dragState) {
    const { nodeId, origin, paintIndex, startPoint } = dragState;
    const state = store.getState();
    const node = selectNodes(state)[nodeId];

    if (isAppearanceNode(node)) {
      const paint = node.fills[paintIndex];

      if (paint?.type === 'image') {
        const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
        const crop = { ...origin, x: origin.x + (point.x - startPoint.x), y: origin.y + (point.y - startPoint.y) };
        const fills = node.fills.map((fill, index) => (index === paintIndex ? { ...paint, crop } : fill));

        dispatch(updateNode({ changes: { fills }, id: nodeId }));
      }
    }
  }
};
