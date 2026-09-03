// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';

const HOVER_LABEL_OFFSET_DIRECTION = { x: 1, y: -1 };

export const drawSmartSelectionGapHoverLabel = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const dragState = refs.smartSelection.gapDragRef.current;
  const hoverState = refs.hover.hoveredSmartSelectionGapRef.current;
  const label = dragState
    ? { point: dragState.badgeAnchor, value: dragState.currentGapValue }
    : hoverState && { point: hoverState.point, value: hoverState.gapValue };

  if (label) {
    drawValueLabel(
      gl,
      program,
      buffer,
      imageContext,
      String(Math.round(label.value)),
      label.point,
      HOVER_LABEL_OFFSET_DIRECTION,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
