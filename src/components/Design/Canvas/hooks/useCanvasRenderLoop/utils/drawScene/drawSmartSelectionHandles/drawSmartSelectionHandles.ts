// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawSmartSelectionGapHoverLabel } from './drawSmartSelectionGapHoverLabel';
import { drawSmartSelectionLayoutHandles } from './drawSmartSelectionLayoutHandles';
import { drawSmartSelectionSuggestion } from './drawSmartSelectionSuggestion';
import { drawSmartSelectionSwapShadow } from './drawSmartSelectionSwapShadow';
import { getSmartSelectionLayout } from '../../../../../utils/getSmartSelectionLayout/getSmartSelectionLayout';

export const drawSmartSelectionHandles = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  refs: TCanvasRefs,
  nodesById: Record<string, TSceneNode>,
): void => {
  const isMoveDragActive = refs.transform.draggedNodeIdsRef.current !== null;

  if (!isMoveDragActive) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
    const layout = getSmartSelectionLayout(selectedNodes, viewport, nodesById);
    const gapDragState = refs.smartSelection.gapDragRef.current;
    const swapDragState = refs.smartSelection.swapDragRef.current;
    const isBoxActive = Boolean(gapDragState) || refs.hover.isSmartSelectionBoxHoveredRef.current;

    if (swapDragState?.hasMoved) {
      drawSmartSelectionSwapShadow(gl, program, buffer, swapDragState, canvasWidth, canvasHeight, viewport);
    }

    if (layout && !swapDragState) {
      drawSmartSelectionLayoutHandles(context, refs, layout, gapDragState, isBoxActive);
    } else if (!layout && isBoxActive) {
      drawSmartSelectionSuggestion(context, selectedNodes, nodesById);
    }

    drawSmartSelectionGapHoverLabel(context, refs);
  }
};
