// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TSmartSelectionSuggestion } from 'types/design/smartSelection/types';

// utils
import { getSmartSelectionSuggestion } from './getSmartSelectionSuggestion';
import { getSmartSelectionSuggestionIconRect } from './getSmartSelectionSuggestionIconRect';

export type TSmartSelectionSuggestionHit = { rect: TDraftRect; suggestion: TSmartSelectionSuggestion };

const isPointInRect = (point: TPoint, rect: TDraftRect): boolean =>
  point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;

export const getSmartSelectionSuggestionIconAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): TSmartSelectionSuggestionHit | null => {
  const suggestion = getSmartSelectionSuggestion(selectedNodes, viewport);

  if (suggestion) {
    const rect = getSmartSelectionSuggestionIconRect(selectedNodes, viewport);

    if (isPointInRect(point, rect)) {
      return { rect, suggestion };
    }
  }

  return null;
};
