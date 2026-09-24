// others
import { ALIGNMENT_SNAP_TOLERANCE_PX, EQUAL_SPACING_SNAP_TOLERANCE_PX, SMART_SELECTION_SUGGESTION_MAX_NODES } from 'constant/canvas';

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

type TSuggestionCache = {
  nodes: TSceneNode[];
  nodesById: Record<string, TSceneNode>;
  suggestion: TSmartSelectionSuggestion | null;
  zoom: number;
};

let cache: TSuggestionCache | null = null;

const computeSmartSelectionSuggestion = (
  nodes: TSceneNode[],
  viewport: TViewport,
  nodesById: Record<string, TSceneNode>,
): TSmartSelectionSuggestion | null => {
  if (
    nodes.length >= 3 &&
    nodes.length <= SMART_SELECTION_SUGGESTION_MAX_NODES &&
    isEligibleForSmartSelection(nodes, nodesById) &&
    getSmartSelectionLayout(nodes, viewport, nodesById) === null
  ) {
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

export const getSmartSelectionSuggestion = (
  nodes: TSceneNode[],
  viewport: TViewport,
  nodesById: Record<string, TSceneNode>,
): TSmartSelectionSuggestion | null => {
  if (!cache || cache.nodes !== nodes || cache.nodesById !== nodesById || cache.zoom !== viewport.zoom) {
    const suggestion = computeSmartSelectionSuggestion(nodes, viewport, nodesById);
    cache = { nodes, nodesById, suggestion, zoom: viewport.zoom };

    return suggestion;
  }

  return cache.suggestion;
};
