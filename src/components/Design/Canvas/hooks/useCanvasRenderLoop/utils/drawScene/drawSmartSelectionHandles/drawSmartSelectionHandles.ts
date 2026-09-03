// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawSmartSelectionGapFillPreview } from './drawSmartSelectionGapFillPreview';
import { drawSmartSelectionGapHandles } from './drawSmartSelectionGapHandles';
import { drawSmartSelectionGapHoverLabel } from './drawSmartSelectionGapHoverLabel';
import { drawSmartSelectionSwapHandles } from './drawSmartSelectionSwapHandles';
import { drawSmartSelectionSwapShadow } from './drawSmartSelectionSwapShadow';
import { getSmartSelectionLayout } from '../../../../../utils/getSmartSelectionLayout/getSmartSelectionLayout';

export const drawSmartSelectionHandles = (context: TDrawSceneContext, selectedNodes: TSceneNode[], refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const layout = getSmartSelectionLayout(selectedNodes, viewport);
  const dragState = refs.smartSelection.gapDragRef.current;
  const swapDragState = refs.smartSelection.swapDragRef.current;
  const isBoxActive = Boolean(dragState) || refs.hover.isSmartSelectionBoxHoveredRef.current;

  if (swapDragState?.hasMoved) {
    drawSmartSelectionSwapShadow(gl, program, buffer, swapDragState, canvasWidth, canvasHeight, viewport);
  }

  if (layout) {
    if (dragState) {
      drawSmartSelectionGapFillPreview(gl, program, buffer, layout, dragState.axis, canvasWidth, canvasHeight, viewport);
    }

    if (isBoxActive) {
      drawSmartSelectionGapHandles(gl, program, buffer, layout, canvasWidth, canvasHeight, viewport);
    }

    drawSmartSelectionSwapHandles(
      gl,
      program,
      buffer,
      layout,
      isBoxActive,
      refs.hover.hoveredSmartSelectionSwapRef.current?.center ?? null,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }

  drawSmartSelectionGapHoverLabel(context, refs);
};
