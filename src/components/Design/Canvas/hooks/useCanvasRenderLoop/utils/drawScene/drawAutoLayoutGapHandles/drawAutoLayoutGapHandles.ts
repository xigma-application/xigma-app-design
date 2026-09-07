// store
import { getAutoLayoutFrameCenter } from 'store/design/utils/autoLayout/getAutoLayoutFrameCenter';
import { getAutoLayoutGapHandles as getGapHandles } from 'store/design/utils/autoLayout/getAutoLayoutGapHandles';
import { getSelectedAutoLayoutFrame } from 'store/design/utils/autoLayout/getSelectedAutoLayoutFrame';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawAutoLayoutGapHandleBars } from './drawAutoLayoutGapHandleBars';
import { drawAutoLayoutGapHatchFill } from './drawAutoLayoutGapHatchFill';
import { drawAutoLayoutGapLabel } from './drawAutoLayoutGapLabel';
import { drawAutoLayoutGapOutline } from './drawAutoLayoutGapOutline';

export const drawAutoLayoutGapHandles = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  refs: TCanvasRefs,
  nodesById: Record<string, TSceneNode>,
): void => {
  const frame = getSelectedAutoLayoutFrame(selectedNodes);
  const dragState = refs.transform.autoLayoutGapDragRef.current;
  const hoverState = refs.hover.hoveredAutoLayoutGapRef.current;

  if (frame && (refs.hover.isAutoLayoutGapAreaHoveredRef.current || dragState)) {
    const children = frame.childIds.map((childId) => nodesById[childId]).filter(Boolean);
    const handles = getGapHandles(frame, children);
    const frameCenter = getAutoLayoutFrameCenter(frame);

    drawAutoLayoutGapHandleBars(context, handles, frameCenter, frame.rotation);

    if (dragState) {
      drawAutoLayoutGapOutline(
        context,
        dragState.axis === 'horizontal' ? handles.horizontal : handles.vertical,
        frameCenter,
        frame.rotation,
      );
    } else if (hoverState) {
      drawAutoLayoutGapHatchFill(
        context,
        hoverState.axis === 'horizontal' ? handles.horizontal : handles.vertical,
        frameCenter,
        frame.rotation,
      );
    }
  }

  drawAutoLayoutGapLabel(context, refs, nodesById);
};
