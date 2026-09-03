// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';

const OFFSET_DIRECTION_BY_AXIS = { x: { x: 0, y: -1 }, y: { x: 1, y: 0 } } as const;

export const drawSmartSelectionGapValueBadge = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const dragState = refs.smartSelection.gapDragRef.current;

  if (dragState) {
    drawValueLabel(
      gl,
      program,
      buffer,
      imageContext,
      String(Math.round(dragState.currentGapValue)),
      dragState.badgeAnchor,
      OFFSET_DIRECTION_BY_AXIS[dragState.axis],
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
