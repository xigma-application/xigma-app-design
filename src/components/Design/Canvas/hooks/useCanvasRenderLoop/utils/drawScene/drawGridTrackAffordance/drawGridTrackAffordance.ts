// store
import { getAutoLayoutFrameCenter } from 'store/design/utils/autoLayout/getAutoLayoutFrameCenter';
import { getSelectedGridFrame } from 'store/design/utils/autoLayout/getSelectedGridFrame';

// types
import { TCanvasRefs, TGridTrackSelection } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawGridTrackAffordanceAxisDraws } from './drawGridTrackAffordanceAxisDraws';
import { drawGridTrackAffordanceDropIndicator } from './drawGridTrackAffordanceDropIndicator';
import { drawGridTrackAffordanceGhost } from './drawGridTrackAffordanceGhost';
import { getGridTrackAffordancePillOffset } from 'utils/canvas/gridSlots/getGridTrackAffordancePillOffset';
import { getGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';

export const drawGridTrackAffordance = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  refs: TCanvasRefs,
  nodesById: Record<string, TSceneNode>,
  gridTrackSelection: TGridTrackSelection | null,
): void => {
  const frame = getSelectedGridFrame(selectedNodes);

  if (frame) {
    const rawHover = refs.hover.hoveredGridTrackAffordanceRef.current;
    const hover = rawHover && rawHover.frameId === frame.id ? rawHover : null;
    const selection = gridTrackSelection && gridTrackSelection.frameId === frame.id ? gridTrackSelection : null;
    const rawDragState = refs.transform.gridTrackAffordanceDragRef.current;
    const dragState = rawDragState && rawDragState.frameId === frame.id ? rawDragState : null;

    if (hover || selection || dragState) {
      const layout = getGridTrackLayout(frame, nodesById);
      const frameCenter = getAutoLayoutFrameCenter(frame);
      const offset = getGridTrackAffordancePillOffset(context.viewport.zoom);

      drawGridTrackAffordanceAxisDraws(context, frame, layout, 'column', hover, selection, offset, frameCenter, dragState);
      drawGridTrackAffordanceAxisDraws(context, frame, layout, 'row', hover, selection, offset, frameCenter, dragState);
      drawGridTrackAffordanceDropIndicator(context, frame, layout, dragState, frameCenter);
      drawGridTrackAffordanceGhost(context, frame, layout, dragState, frameCenter);
    }
  }
};
