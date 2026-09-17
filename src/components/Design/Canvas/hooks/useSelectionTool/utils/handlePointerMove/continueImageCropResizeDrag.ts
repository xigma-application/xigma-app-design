import { RefObject } from 'react';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TImageCropResizeDragState } from 'types/design/canvas/types';
import { TImageCrop } from 'types/design/paint/types';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getResizeAnchorSolver } from './continueResizeDrag/getResizeAnchorSolver';
import { getResizeQueryPoint } from './continueResizeDrag/getResizeQueryPoint';
import { getScaleFactors } from './continueResizeDrag/getScaleFactors';
import { getResizedPosition } from './continueResizeDrag/resizeNode/getResizedPosition';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const continueImageCropResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  imageCropResizeDragRef: RefObject<TImageCropResizeDragState | null>,
): void => {
  const dragState = imageCropResizeDragRef.current;

  if (dragState) {
    const { handle, nodeId, origin, originalFlipX, originalFlipY, paintIndex } = dragState;
    const state = store.getState();
    const node = selectNodes(state)[nodeId];

    if (isAppearanceNode(node)) {
      const paint = node.fills[paintIndex];

      if (paint?.type === 'image') {
        const rawPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
        const singleRotatableOrigin = origin.rotation !== 0 ? { ...origin, flip: null } : null;
        const queryPoint = getResizeQueryPoint(rawPoint, origin, singleRotatableOrigin);
        const aspectRatio = origin.height !== 0 ? origin.width / origin.height : 1;
        const { anchors, scaleX, scaleY } = getScaleFactors(handle, origin, queryPoint, aspectRatio);
        const rotatedAnchorSolver = getResizeAnchorSolver(origin, handle, scaleX, scaleY, singleRotatableOrigin);
        const height = Math.round(origin.height * Math.abs(scaleY));
        const width = Math.round(origin.width * Math.abs(scaleX));
        const { x, y } = getResizedPosition(origin, anchors, scaleX, scaleY, width, height, rotatedAnchorSolver);
        const _x = origin.rotation !== 0 ? x : Math.round(x);
        const _y = origin.rotation !== 0 ? y : Math.round(y);
        const crop: TImageCrop = { height, rotation: origin.rotation, width, x: _x, y: _y };
        const flipX = scaleX < 0 ? !originalFlipX : originalFlipX;
        const flipY = scaleY < 0 ? !originalFlipY : originalFlipY;
        const fills = node.fills.map((fill, index) => (index === paintIndex ? { ...paint, crop, flipX, flipY } : fill));

        dispatch(updateNode({ changes: { fills }, id: nodeId }));
      }
    }
  }
};
