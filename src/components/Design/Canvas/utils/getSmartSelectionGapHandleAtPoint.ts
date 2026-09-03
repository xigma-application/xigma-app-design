// others
import { SMART_SELECTION_GAP_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TSmartSelectionGap, TSmartSelectionLayout } from 'types/design/smartSelection/types';

// utils
import { getSmartSelectionLayout } from './getSmartSelectionLayout/getSmartSelectionLayout';

export type TSmartSelectionGapHit = {
  axis: 'x' | 'y';
  gapIndex: number;
  gapValue: number;
  layout: TSmartSelectionLayout;
  midpoint: TPoint;
};

const findNearestGap = (point: TPoint, gaps: TSmartSelectionGap[], toleranceWorldUnits: number): TSmartSelectionGap | null =>
  gaps.find((gap) => Math.hypot(point.x - gap.midpoint.x, point.y - gap.midpoint.y) <= toleranceWorldUnits) ?? null;

export const getSmartSelectionGapHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): TSmartSelectionGapHit | null => {
  const layout = getSmartSelectionLayout(selectedNodes, viewport);
  const tolerance = SMART_SELECTION_GAP_HANDLE_HIT_RADIUS_PX / viewport.zoom;

  if (layout) {
    if (layout.type === 'grid') {
      const columnHit = findNearestGap(point, layout.columnGaps, tolerance);
      const rowHit = findNearestGap(point, layout.rowGaps, tolerance);

      if (columnHit) {
        return { axis: 'x', gapIndex: columnHit.index, gapValue: columnHit.value, layout, midpoint: columnHit.midpoint };
      }

      if (rowHit) {
        return { axis: 'y', gapIndex: rowHit.index, gapValue: rowHit.value, layout, midpoint: rowHit.midpoint };
      }
    } else {
      const hit = findNearestGap(point, layout.gaps, tolerance);

      if (hit) {
        return { axis: layout.type === 'row' ? 'x' : 'y', gapIndex: hit.index, gapValue: hit.value, layout, midpoint: hit.midpoint };
      }
    }
  }

  return null;
};
