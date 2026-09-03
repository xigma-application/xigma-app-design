// others
import { SMART_SELECTION_SUGGESTION_ICON_MARGIN_PX, SMART_SELECTION_SUGGESTION_ICON_SIZE_PX } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getSelectionBounds } from './getSelectionBounds';

export const getSmartSelectionSuggestionIconRect = (selectedNodes: TSceneNode[], viewport: TViewport): TDraftRect => {
  const bounds = getSelectionBounds(selectedNodes);
  const size = SMART_SELECTION_SUGGESTION_ICON_SIZE_PX / viewport.zoom;
  const margin = SMART_SELECTION_SUGGESTION_ICON_MARGIN_PX / viewport.zoom;

  return { height: size, width: size, x: bounds.x + bounds.width + margin, y: bounds.y + bounds.height + margin };
};
