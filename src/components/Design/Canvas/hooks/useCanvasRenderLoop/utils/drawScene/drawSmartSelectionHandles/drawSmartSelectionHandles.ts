// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawSmartSelectionGapHandles } from './drawSmartSelectionGapHandles';
import { drawSmartSelectionGapHoverLabel } from './drawSmartSelectionGapHoverLabel';
import { drawSmartSelectionSwapHandles } from './drawSmartSelectionSwapHandles';
import { getSmartSelectionLayout } from '../../../../../utils/getSmartSelectionLayout/getSmartSelectionLayout';

export const drawSmartSelectionHandles = (context: TDrawSceneContext, selectedNodes: TSceneNode[], refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const layout = getSmartSelectionLayout(selectedNodes, viewport);

  if (layout) {
    drawSmartSelectionGapHandles(gl, program, buffer, layout, canvasWidth, canvasHeight, viewport);
    drawSmartSelectionSwapHandles(gl, program, buffer, layout, canvasWidth, canvasHeight, viewport);
  }

  drawSmartSelectionGapHoverLabel(context, refs);
};
