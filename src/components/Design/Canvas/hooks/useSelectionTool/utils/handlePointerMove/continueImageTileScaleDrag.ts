import { RefObject } from 'react';

// others
import { IMAGE_FILL_MAX_TILE_SCALE, IMAGE_FILL_MIN_TILE_SCALE } from 'constant/canvas';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TImageTileScaleDragState } from 'types/design/canvas/types';

// utils
import { clamp } from 'utils/math/clamp';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const continueImageTileScaleDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  imageTileScaleDragRef: RefObject<TImageTileScaleDragState | null>,
): void => {
  const dragState = imageTileScaleDragRef.current;

  if (dragState) {
    const { anchor, nodeId, paintIndex, startDistance, startScale } = dragState;
    const state = store.getState();
    const node = selectNodes(state)[nodeId];

    if (isAppearanceNode(node) && startDistance > 0) {
      const paint = node.fills[paintIndex];

      if (paint?.type === 'image') {
        const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
        const currentDistance = Math.hypot(point.x - anchor.x, point.y - anchor.y);
        const scale = clamp(startScale * (currentDistance / startDistance), IMAGE_FILL_MIN_TILE_SCALE, IMAGE_FILL_MAX_TILE_SCALE);
        const fills = node.fills.map((fill, index) => (index === paintIndex ? { ...paint, scale } : fill));

        dispatch(updateNode({ changes: { fills }, id: nodeId }));
      }
    }
  }
};
