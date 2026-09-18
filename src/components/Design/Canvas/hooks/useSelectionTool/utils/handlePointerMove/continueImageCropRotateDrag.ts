import { RefObject } from 'react';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TImageCropRotateDragState } from 'types/design/canvas/types';
import { TImageCrop } from 'types/design/paint/types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { rotateShapeNodeOrigin } from './continueRotateDrag/rotateShapeNodeOrigin';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const continueImageCropRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  imageCropRotateDragRef: RefObject<TImageCropRotateDragState | null>,
): void => {
  const dragState = imageCropRotateDragRef.current;

  if (dragState) {
    const { nodeId, origin, paintIndex, pivot, startAngle } = dragState;
    const state = store.getState();
    const node = selectNodes(state)[nodeId];

    if (isAppearanceNode(node)) {
      const paint = node.fills[paintIndex];

      if (paint?.type === 'image' || paint?.type === 'video') {
        const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
        const deltaDegrees = getAngleBetweenPoints(pivot, point) - startAngle;
        const { rotation, x, y } = rotateShapeNodeOrigin(origin, pivot, deltaDegrees);
        const crop: TImageCrop = { height: origin.height, rotation, width: origin.width, x, y };
        const fills = node.fills.map((fill, index) => (index === paintIndex ? { ...paint, crop } : fill));

        dispatch(updateNode({ changes: { fills }, id: nodeId }));
      }
    }
  }
};
