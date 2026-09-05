// types
import { TCanvasRefs, TSmartSelectionGapDragState } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';

// utils
import { drawSmartSelectionGapFillPreview } from './drawSmartSelectionGapFillPreview/drawSmartSelectionGapFillPreview';
import { drawSmartSelectionGapHandles } from './drawSmartSelectionGapHandles';
import { drawSmartSelectionSwapHandles } from './drawSmartSelectionSwapHandles';

export const drawSmartSelectionLayoutHandles = (
  context: TDrawSceneContext,
  refs: TCanvasRefs,
  layout: TSmartSelectionLayout,
  gapDragState: TSmartSelectionGapDragState | null,
  isBoxActive: boolean,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  if (gapDragState) {
    drawSmartSelectionGapFillPreview(gl, program, buffer, layout, gapDragState.axis, canvasWidth, canvasHeight, viewport);
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
};
