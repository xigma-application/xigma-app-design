import { RefObject } from 'react';

// others
import { ALIGNMENT_SNAP_TOLERANCE_PX } from 'constant/canvas';

// store
import { selectImageEditor, selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs, TImageCropMoveDragState } from 'types/design/canvas/types';

// utils
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { getPaintReplaceChange } from 'utils/design/paint/getPaintReplaceChange';
import { getImageCropMoveAlignmentSnap } from './getImageCropMoveAlignmentSnap';
import { getNodeBounds } from 'components/Design/Canvas/utils/getNodeBounds';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const continueImageCropMoveDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  imageCropMoveDragRef: RefObject<TImageCropMoveDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  const dragState = imageCropMoveDragRef.current;

  if (dragState) {
    const { nodeId, origin, paintIndex, startPoint } = dragState;
    const state = store.getState();
    const node = selectNodes(state)[nodeId];

    if (isAppearanceNode(node)) {
      const property = selectImageEditor(state)?.property;
      const paint = getNodePaints(node, property)[paintIndex];

      if (paint?.type === 'image' || paint?.type === 'video') {
        const viewport = selectViewport(state);
        const point = screenToWorld(getPointerPosition(canvas, event), viewport);
        const rawDelta = { x: point.x - startPoint.x, y: point.y - startPoint.y };
        const canSnap = origin.rotation === 0 && node.rotation === 0;
        const cropBoundsAtDelta = { height: origin.height, width: origin.width, x: origin.x + rawDelta.x, y: origin.y + rawDelta.y };
        const { delta, guide } = canSnap
          ? getImageCropMoveAlignmentSnap(cropBoundsAtDelta, getNodeBounds(node), rawDelta, ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom)
          : { delta: rawDelta, guide: null };
        const crop = { ...origin, x: origin.x + delta.x, y: origin.y + delta.y };
        const change = getPaintReplaceChange(node, property, paintIndex, { ...paint, crop });

        canvasRefs.transform.alignmentGuideRef.current = guide;

        dispatch(updateNode({ changes: change, id: nodeId }));
      }
    }
  }
};
