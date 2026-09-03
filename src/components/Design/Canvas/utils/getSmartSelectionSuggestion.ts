// others
import { ALIGNMENT_SNAP_TOLERANCE_PX, EQUAL_SPACING_SNAP_TOLERANCE_PX } from 'constant/canvas';

// types
import { TSceneNode, TViewport } from 'types/design/types';
import { TSmartSelectionSuggestion } from 'types/design/smartSelection/types';

// utils
import { getAxisAlignedNodeBounds } from './getSmartSelectionLayout/getAxisAlignedNodeBounds';
import { getSmartSelectionAppendOutlierSuggestion } from './getSmartSelectionAppendOutlierSuggestion';
import { getSmartSelectionEqualizeSuggestion } from './getSmartSelectionEqualizeSuggestion';
import { getSmartSelectionGridAppendSuggestion } from './getSmartSelectionGridAppendSuggestion/getSmartSelectionGridAppendSuggestion';
import { getSmartSelectionGridEqualizeSuggestion } from './getSmartSelectionGridEqualizeSuggestion';
import { getSmartSelectionLayout } from './getSmartSelectionLayout/getSmartSelectionLayout';
import { isEligibleForSmartSelection } from './getSmartSelectionLayout/isEligibleForSmartSelection';

export const getSmartSelectionSuggestion = (nodes: TSceneNode[], viewport: TViewport): TSmartSelectionSuggestion | null => {
  if (nodes.length >= 3 && isEligibleForSmartSelection(nodes) && getSmartSelectionLayout(nodes, viewport) === null) {
    const bounds = getAxisAlignedNodeBounds(nodes);
    const alignmentTolerance = ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom;
    const gapTolerance = EQUAL_SPACING_SNAP_TOLERANCE_PX / viewport.zoom;

    return (
      getSmartSelectionEqualizeSuggestion(bounds, gapTolerance) ??
      getSmartSelectionAppendOutlierSuggestion(bounds, gapTolerance) ??
      getSmartSelectionGridEqualizeSuggestion(bounds, alignmentTolerance, gapTolerance) ??
      getSmartSelectionGridAppendSuggestion(bounds, alignmentTolerance, gapTolerance)
    );
  }

  return null;
};
