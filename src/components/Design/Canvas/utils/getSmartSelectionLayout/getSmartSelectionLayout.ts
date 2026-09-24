// others
import { ALIGNMENT_SNAP_TOLERANCE_PX, EQUAL_SPACING_SNAP_TOLERANCE_PX } from 'constant/canvas';

// types
import { TSceneNode, TViewport } from 'types/design/types';
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';

// utils
import { detectGridLayout } from './detectGridLayout';
import { getAxisAlignedNodeBounds } from './getAxisAlignedNodeBounds';
import { getHorizontalLayout } from './getHorizontalLayout';
import { getVerticalLayout } from './getVerticalLayout';
import { isEligibleForSmartSelection } from './isEligibleForSmartSelection';

type TLayoutCache = {
  layout: TSmartSelectionLayout | null;
  nodes: TSceneNode[];
  nodesById: Record<string, TSceneNode>;
  zoom: number;
};

let cache: TLayoutCache | null = null;

const computeSmartSelectionLayout = (
  nodes: TSceneNode[],
  viewport: TViewport,
  nodesById: Record<string, TSceneNode>,
): TSmartSelectionLayout | null => {
  if (isEligibleForSmartSelection(nodes, nodesById)) {
    const bounds = getAxisAlignedNodeBounds(nodes);
    const alignmentTolerance = ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom;
    const gapTolerance = EQUAL_SPACING_SNAP_TOLERANCE_PX / viewport.zoom;

    return (
      getHorizontalLayout(bounds, gapTolerance) ??
      getVerticalLayout(bounds, gapTolerance) ??
      detectGridLayout(bounds, alignmentTolerance, gapTolerance)
    );
  }

  return null;
};

export const getSmartSelectionLayout = (
  nodes: TSceneNode[],
  viewport: TViewport,
  nodesById: Record<string, TSceneNode>,
): TSmartSelectionLayout | null => {
  if (!cache || cache.nodes !== nodes || cache.nodesById !== nodesById || cache.zoom !== viewport.zoom) {
    const layout = computeSmartSelectionLayout(nodes, viewport, nodesById);
    cache = { layout, nodes, nodesById, zoom: viewport.zoom };

    return layout;
  }

  return cache.layout;
};
