// store
import { getAutoLayoutFrameCenter } from 'store/design/utils/autoLayout/getAutoLayoutFrameCenter';
import { getSelectedAutoLayoutFrame } from 'store/design/utils/autoLayout/getSelectedAutoLayoutFrame';

// types
import { TAutoLayoutPaddingSide } from 'utils/canvas/autoLayoutPadding/types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawAutoLayoutPaddingGuideLine } from './drawAutoLayoutPaddingGuideLine';
import { drawAutoLayoutPaddingHandleBar } from './drawAutoLayoutPaddingHandleBar';
import { drawAutoLayoutPaddingHatchFill } from './drawAutoLayoutPaddingHatchFill';
import { drawAutoLayoutPaddingLabel } from './drawAutoLayoutPaddingLabel';
import { getAutoLayoutPaddingHandles } from 'utils/canvas/autoLayoutPadding/getAutoLayoutPaddingHandles';

const SIDES: TAutoLayoutPaddingSide[] = ['left', 'right', 'top', 'bottom'];

export const drawAutoLayoutPaddingHandles = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  refs: TCanvasRefs,
  nodesById: Record<string, TSceneNode>,
): void => {
  const frame = getSelectedAutoLayoutFrame(selectedNodes);
  const dragState = refs.transform.autoLayoutPaddingDragRef.current;
  const hoverState = refs.hover.hoveredAutoLayoutPaddingRef.current;
  const rightPanelGuide = refs.hover.rightPanelPaddingGuideRef.current;

  if (frame) {
    const handles = getAutoLayoutPaddingHandles(frame, context.viewport, dragState?.side ?? null);
    const frameCenter = getAutoLayoutFrameCenter(frame);

    if (refs.hover.isAutoLayoutPaddingAreaHoveredRef.current || dragState) {
      SIDES.forEach((side) => {
        const handle = handles[side];
        const isDraggingThisSide = dragState?.side === side;

        if (isDraggingThisSide) {
          drawAutoLayoutPaddingGuideLine(context, frame, handle.band, side, frameCenter, frame.rotation);
        } else if (handle.value > 0 || hoverState?.side === side) {
          drawAutoLayoutPaddingHandleBar(context, handle.handleCenter, side, frameCenter, frame.rotation);

          if (handle.value > 0) {
            drawAutoLayoutPaddingHatchFill(context, handle.band, frameCenter, frame.rotation);
          }
        }
      });
    }

    if (rightPanelGuide && rightPanelGuide.frameId === frame.id && !dragState) {
      rightPanelGuide.sides.forEach((side) => {
        drawAutoLayoutPaddingGuideLine(context, frame, handles[side].band, side, frameCenter, frame.rotation);
      });
    }
  }

  drawAutoLayoutPaddingLabel(context, refs, nodesById);
};
