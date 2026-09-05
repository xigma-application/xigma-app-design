// types
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawSmartSelectionSuggestionIcon } from './drawSmartSelectionSuggestionIcon';
import { getSmartSelectionSuggestion } from '../../../../../utils/getSmartSelectionSuggestion';
import { getSmartSelectionSuggestionIconRect } from '../../../../../utils/getSmartSelectionSuggestionIconRect';
import { getSmartSelectionSuggestionKind } from './getSmartSelectionSuggestionKind';

export const drawSmartSelectionSuggestion = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const suggestion = getSmartSelectionSuggestion(selectedNodes, viewport, nodesById);

  if (suggestion) {
    drawSmartSelectionSuggestionIcon(
      gl,
      program,
      buffer,
      getSmartSelectionSuggestionIconRect(selectedNodes, viewport),
      getSmartSelectionSuggestionKind(suggestion),
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
