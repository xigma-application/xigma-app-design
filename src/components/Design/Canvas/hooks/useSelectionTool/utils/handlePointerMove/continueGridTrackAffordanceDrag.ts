import { RefObject } from 'react';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';

// utils
import { getGridTrackAffordanceDropIndex } from 'utils/canvas/gridSlots/getGridTrackAffordanceDropIndex';
import { getGridTrackAffordancePillOffset } from 'utils/canvas/gridSlots/getGridTrackAffordancePillOffset';
import { getGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getUnrotatedQueryPoint } from 'components/Design/Canvas/utils/getUnrotatedQueryPoint';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const continueGridTrackAffordanceDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dragRef: RefObject<TGridTrackAffordanceDragState | null>,
): void => {
  const dragState = dragRef.current;

  if (dragState) {
    const state = store.getState();
    const viewport = selectViewport(state);
    const nodesById = selectNodes(state);
    const frame = nodesById[dragState.frameId];

    if (frame && frame.type === NodeType.frame) {
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const localPoint = getUnrotatedQueryPoint(point, frame, frame.rotation);
      const layout = getGridTrackLayout(frame, nodesById);
      const sizes = dragState.axis === 'column' ? layout.columnSizes : layout.rowSizes;
      const gap = dragState.axis === 'column' ? layout.columnGap : layout.rowGap;
      const padding = dragState.axis === 'column' ? layout.padding.paddingLeft : layout.padding.paddingTop;
      const framePosition = dragState.axis === 'column' ? localPoint.x - frame.x : localPoint.y - frame.y;
      const pillOffset = getGridTrackAffordancePillOffset(viewport.zoom);

      dragState.hasMoved = true;
      dragState.dropIndex = getGridTrackAffordanceDropIndex(sizes, gap, framePosition - padding);
      dragState.ghostPosition =
        dragState.axis === 'column' ? { x: localPoint.x, y: frame.y - pillOffset } : { x: frame.x - pillOffset, y: localPoint.y };
    }
  }
};
