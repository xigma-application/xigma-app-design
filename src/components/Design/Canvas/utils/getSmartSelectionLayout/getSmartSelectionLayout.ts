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

export const getSmartSelectionLayout = (nodes: TSceneNode[], viewport: TViewport): TSmartSelectionLayout | null => {
  if (isEligibleForSmartSelection(nodes)) {
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
