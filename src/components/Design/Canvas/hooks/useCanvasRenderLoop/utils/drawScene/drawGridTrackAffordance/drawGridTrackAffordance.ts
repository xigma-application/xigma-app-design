// store
import { getAutoLayoutFrameCenter } from 'store/design/utils/autoLayout/getAutoLayoutFrameCenter';
import { getSelectedGridFrame } from 'store/design/utils/autoLayout/getSelectedGridFrame';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawGridTrackAffordancePill } from './drawGridTrackAffordancePill';
import { getGridTrackAffordancePillOffset } from 'utils/canvas/gridSlots/getGridTrackAffordancePillOffset';
import { getGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';
import { getGridTrackOffset } from 'utils/canvas/gridSlots/getGridTrackOffset';

export const drawGridTrackAffordance = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  refs: TCanvasRefs,
  nodesById: Record<string, TSceneNode>,
): void => {
  const frame = getSelectedGridFrame(selectedNodes);
  const hover = refs.hover.hoveredGridTrackAffordanceRef.current;

  if (frame && hover && hover.frameId === frame.id) {
    const layout = getGridTrackLayout(frame, nodesById);
    const frameCenter = getAutoLayoutFrameCenter(frame);
    const offset = getGridTrackAffordancePillOffset(context.viewport.zoom);
    const columnCenterX =
      frame.x +
      layout.padding.paddingLeft +
      getGridTrackOffset(layout.columnSizes, layout.columnGap, hover.columnIndex) +
      (layout.columnSizes[hover.columnIndex] ?? 0) / 2;
    const rowCenterY =
      frame.y +
      layout.padding.paddingTop +
      getGridTrackOffset(layout.rowSizes, layout.rowGap, hover.rowIndex) +
      (layout.rowSizes[hover.rowIndex] ?? 0) / 2;

    drawGridTrackAffordancePill(context, { x: columnCenterX, y: frame.y - offset }, 'column', frame.rotation, frameCenter);
    drawGridTrackAffordancePill(context, { x: frame.x - offset, y: rowCenterY }, 'row', frame.rotation, frameCenter);
  }
};
